import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAdminEmailAllowed } from "@/lib/auth/admin-allowlist";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (!user.email) {
        return false;
      }

      if (!isAdminEmailAllowed(user.email)) {
        return false;
      }

      await prisma.admin.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          name: user.name,
          googleId: account?.providerAccountId,
          profileImageUrl: user.image,
        },
        update: {
          name: user.name,
          googleId: account?.providerAccountId,
          profileImageUrl:
            user.image ??
            (profile && "picture" in profile ? String(profile.picture) : null),
        },
      });

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const admin = await prisma.admin.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });

        if (admin) {
          session.user.id = admin.id;
        }
      }

      return session;
    },
  },
};

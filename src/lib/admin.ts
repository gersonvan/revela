import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminEmailAllowed } from "@/lib/auth/admin-allowlist";
import { prisma } from "@/lib/prisma";

export async function getCurrentAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  if (!isAdminEmailAllowed(session.user.email)) {
    return null;
  }

  return prisma.admin.upsert({
    where: { email: session.user.email },
    create: {
      email: session.user.email,
      name: session.user.name,
      profileImageUrl: session.user.image,
    },
    update: {
      name: session.user.name,
      profileImageUrl: session.user.image,
    },
  });
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

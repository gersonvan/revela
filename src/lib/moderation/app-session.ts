import { ModeratorStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { createSecretToken, hashSecretToken } from "@/lib/moderation/token";

const SESSION_TTL_DAYS = 30;

export type ModeratorAppSessionAuth =
  | {
      moderator: {
        event: {
          id: string;
          moderationMode: string;
          name: string;
          publicSlug: string;
          status: string;
        };
        eventId: string;
        id: string;
        name: string;
        status: ModeratorStatus;
      };
      session: {
        id: string;
        deviceId: string;
      };
      status: "ok";
    }
  | {
      message: string;
      status: "error";
      statusCode: 401 | 403;
    };

export function createModeratorSessionToken() {
  return createSecretToken();
}

export function moderatorSessionExpiresAt() {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export async function authenticateModeratorAppRequest(
  request: Request,
): Promise<ModeratorAppSessionAuth> {
  const token = readBearerToken(request);

  if (!token) {
    return {
      message: "Sessão do app ausente.",
      status: "error",
      statusCode: 401,
    };
  }

  const tokenHash = hashSecretToken(token);
  const session = await prisma.moderatorSession.findUnique({
    where: { tokenHash },
    include: {
      moderator: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!session || session.revokedAt) {
    return {
      message: "Sessão do app inválida.",
      status: "error",
      statusCode: 401,
    };
  }

  if (session.expiresAt && session.expiresAt <= new Date()) {
    return {
      message: "Sessão do app expirada.",
      status: "error",
      statusCode: 401,
    };
  }

  if (session.moderator.status === ModeratorStatus.REVOKED) {
    return {
      message: "Moderador revogado.",
      status: "error",
      statusCode: 403,
    };
  }

  await prisma.moderatorSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return {
    moderator: session.moderator,
    session: {
      deviceId: session.deviceId,
      id: session.id,
    },
    status: "ok",
  };
}

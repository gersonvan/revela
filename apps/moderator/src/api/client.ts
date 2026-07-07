import type {
  ApiErrorPayload,
  ModeratorContext,
  ModeratorSession,
  PhotoDecisionResponse,
  PhotoListResponse,
  PhotoStatus,
} from "./types";

type RequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  sessionToken?: string | null;
};

const REQUEST_TIMEOUT_MS = 15000;

export class ModeratorApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ModeratorApiError";
    this.status = status;
  }
}

export type ActivateSessionInput = {
  appVersion: string;
  deviceId: string;
  deviceName: string;
  inviteToken: string;
  platform: string;
};

export type RegisterPushTokenInput = {
  appVersion: string;
  platform: string;
  pushToken: string;
};

export function createModeratorApi(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;

    try {
      response = await fetch(`${normalizedBaseUrl}${path}`, {
        body: options.body ? JSON.stringify(options.body) : undefined,
        headers: {
          accept: "application/json",
          ...(options.body ? { "content-type": "application/json" } : {}),
          ...(options.sessionToken
            ? { authorization: `Bearer ${options.sessionToken}` }
            : {}),
        },
        method: options.method ?? "GET",
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ModeratorApiError(
          "Tempo esgotado ao conectar com o servidor.",
          408,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    const responseText = await response.text();
    const payload = responseText ? (JSON.parse(responseText) as unknown) : null;

    if (!response.ok) {
      const errorPayload = payload as ApiErrorPayload | null;
      throw new ModeratorApiError(
        errorPayload?.error ?? `Erro HTTP ${response.status}`,
        response.status,
      );
    }

    return payload as T;
  }

  return {
    activateSession(input: ActivateSessionInput) {
      return requestJson<ModeratorSession>("/api/moderator-app/sessions", {
        body: input,
        method: "POST",
      });
    },

    getContext(sessionToken: string) {
      return requestJson<ModeratorContext>("/api/moderator-app/me", {
        sessionToken,
      });
    },

    listPendingPhotos(sessionToken: string) {
      return requestJson<PhotoListResponse>(
        "/api/moderator-app/photos?status=PENDING&limit=30",
        { sessionToken },
      );
    },

    decidePhoto(sessionToken: string, photoId: string, nextStatus: PhotoStatus) {
      return requestJson<PhotoDecisionResponse>(
        `/api/moderator-app/photos/${encodeURIComponent(photoId)}/decision`,
        {
          body: { nextStatus },
          method: "POST",
          sessionToken,
        },
      );
    },

    registerPushToken(sessionToken: string, input: RegisterPushTokenInput) {
      return requestJson<null>("/api/moderator-app/push-token", {
        body: input,
        method: "PUT",
        sessionToken,
      });
    },

    logout(sessionToken: string) {
      return requestJson<null>("/api/moderator-app/sessions/current", {
        method: "DELETE",
        sessionToken,
      });
    },
  };
}

export type PhotoStatus = "PENDING" | "APPROVED" | "REJECTED";
export type EventModerationMode = "WITH_MODERATION" | "WITHOUT_MODERATION";

export type Counts = {
  approved: number;
  pending: number;
  rejected: number;
};

export type ModeratorSession = {
  sessionToken: string;
  moderator: {
    id: string;
    name: string;
  };
  event: {
    id: string;
    moderationMode: EventModerationMode;
    name: string;
  };
};

export type ModeratorContext = {
  counts: Counts;
  event: {
    id: string;
    moderationMode: EventModerationMode;
    name: string;
    publicSlug: string;
    status: string;
  };
  moderator: {
    id: string;
    name: string;
    status: string;
  };
  permissions: {
    canApprove: boolean;
    canReject: boolean;
    canRegisterPushToken: boolean;
  };
};

export type PhotoItem = {
  guestName: string;
  id: string;
  imageUrl: string;
  message: string | null;
  status: PhotoStatus;
  uploadedAt: string;
};

export type PhotoListResponse = {
  counts: Counts;
  items: PhotoItem[];
  nextCursor: string | null;
};

export type PhotoDecisionResponse = {
  action: "APPROVED" | "REJECTED" | "RESTORED";
  newStatus: PhotoStatus;
  pendingCount: number;
  photoId: string;
  previousStatus: PhotoStatus;
};

export type ApiErrorPayload = {
  error?: string;
};

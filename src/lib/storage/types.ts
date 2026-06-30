export type StoredEventPhoto = {
  originalFileUrl: string;
  optimizedFileUrl: string;
  width: number | null;
  height: number | null;
};

export type StoredEventInvitation = {
  invitationImageUrl: string;
};

export type StorageAdapter = {
  readStoredFile: (mediaPathOrUrl: string) => Promise<Buffer>;
  saveEventInvitation: (input: {
    eventId: string;
    file: File;
  }) => Promise<StoredEventInvitation>;
  saveEventPhoto: (input: {
    eventId: string;
    file: File;
  }) => Promise<StoredEventPhoto>;
};

export const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export function isSupportedImageType(mimeType: string) {
  return Object.keys(extensionByMimeType).includes(mimeType);
}

export function mediaUrlToStoragePath(mediaUrl: string) {
  return mediaUrl.replace(/^\/media\//, "");
}

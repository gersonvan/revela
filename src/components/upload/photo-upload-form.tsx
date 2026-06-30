"use client";

import { FormEvent, useMemo, useState } from "react";

const MAX_FILES = 15;
const MAX_MESSAGE_LENGTH = 120;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

type SelectedPhoto = {
  file: File;
  id: string;
  message: string;
  previewUrl: string;
};

type PhotoUploadFormProps = {
  authorizationText: string;
  eventSlug: string;
};

export function PhotoUploadForm({
  authorizationText,
  eventSlug,
}: PhotoUploadFormProps) {
  const [guestName, setGuestName] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(`eventoon:${eventSlug}:guestName`) ?? "";
  });
  const [acceptedTerms, setAcceptedTerms] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(`eventoon:${eventSlug}:acceptedTerms`) ===
      "true";
  });
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState("");

  const canSubmit = useMemo(
    () =>
      guestName.trim().length > 0 &&
      acceptedTerms &&
      photos.length > 0 &&
      status !== "submitting",
    [acceptedTerms, guestName, photos.length, status],
  );

  function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextFiles = Array.from(files);

    if (photos.length + nextFiles.length > MAX_FILES) {
      setStatus("error");
      setStatusMessage(`Envie no maximo ${MAX_FILES} fotos por vez.`);
      return;
    }

    const invalidFile = nextFiles.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE_BYTES,
    );

    if (invalidFile) {
      setStatus("error");
      setStatusMessage("Use apenas imagens de ate 20 MB.");
      return;
    }

    setPhotos((current) => [
      ...current,
      ...nextFiles.map((file) => ({
        file,
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        message: "",
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setStatus("idle");
    setStatusMessage("");
  }

  function updateMessage(photoId: string, message: string) {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId
          ? { ...photo, message: message.slice(0, MAX_MESSAGE_LENGTH) }
          : photo,
      ),
    );
  }

  function removePhoto(photoId: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === photoId);

      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      return current.filter((item) => item.id !== photoId);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setStatus("submitting");
    setStatusMessage("Enviando fotos...");

    const formData = new FormData();
    formData.append("guestName", guestName.trim());

    photos.forEach((photo, index) => {
      formData.append("photos", photo.file);
      formData.append(`message_${index}`, photo.message.trim());
    });

    const response = await fetch(`/api/events/${eventSlug}/photos`, {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as { error?: string; uploaded?: number };

    if (!response.ok) {
      setStatus("error");
      setStatusMessage(payload.error ?? "Nao foi possivel enviar agora.");
      return;
    }

    window.localStorage.setItem(`eventoon:${eventSlug}:guestName`, guestName.trim());
    window.localStorage.setItem(`eventoon:${eventSlug}:acceptedTerms`, "true");
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
    setStatus("success");
    setStatusMessage(
      `${payload.uploaded ?? 0} foto(s) enviadas para aprovacao.`,
    );
  }

  return (
    <form
      className="mt-8 space-y-6 rounded-lg border border-[#ddd5c7] bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="text-sm font-semibold text-[#172026]">Nome/apelido</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-[#d7cfc1] px-3 text-base outline-none focus:border-[#9a5a44]"
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Como voce quer aparecer no telao"
          required
          value={guestName}
        />
      </label>

      <label className="block rounded-md border border-[#d7cfc1] bg-[#fbfaf7] p-4">
        <span className="flex items-start gap-3">
          <input
            checked={acceptedTerms}
            className="mt-1"
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-semibold text-[#172026]">
              Autorizacao
            </span>
            <span className="mt-1 block text-sm leading-6 text-[#52616b]">
              {authorizationText}
            </span>
          </span>
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[#172026]">Fotos</span>
        <input
          accept="image/*"
          className="mt-2 block w-full rounded-md border border-dashed border-[#d7cfc1] bg-[#fbfaf7] p-4 text-sm text-[#52616b]"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          type="file"
        />
        <span className="mt-2 block text-xs text-[#52616b]">
          Ate 15 fotos por envio, com limite de 20 MB por foto.
        </span>
      </label>

      {photos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {photos.map((photo) => (
            <article
              className="overflow-hidden rounded-md border border-[#ddd5c7]"
              key={photo.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="aspect-[4/3] w-full object-cover"
                src={photo.previewUrl}
              />
              <div className="space-y-3 p-3">
                <label className="block">
                  <span className="text-xs font-semibold text-[#52616b]">
                    Mensagem opcional
                  </span>
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-md border border-[#d7cfc1] px-3 py-2 text-sm outline-none focus:border-[#9a5a44]"
                    maxLength={MAX_MESSAGE_LENGTH}
                    onChange={(event) =>
                      updateMessage(photo.id, event.target.value)
                    }
                    value={photo.message}
                  />
                  <span className="mt-1 block text-right text-xs text-[#52616b]">
                    {photo.message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </label>
                <button
                  className="text-sm font-semibold text-[#9a5a44]"
                  onClick={() => removePhoto(photo.id)}
                  type="button"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {statusMessage ? (
        <p
          className={
            status === "error"
              ? "text-sm font-medium text-red-700"
              : "text-sm font-medium text-[#52616b]"
          }
        >
          {statusMessage}
        </p>
      ) : null}

      <button
        className="h-11 w-full rounded-md bg-[#172026] px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[#9aa6ad]"
        disabled={!canSubmit}
        type="submit"
      >
        {status === "submitting" ? "Enviando..." : "Enviar fotos"}
      </button>
    </form>
  );
}

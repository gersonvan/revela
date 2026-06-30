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

  if (status === "success") {
    return (
      <div className="mt-8 rounded-2xl border border-[#E8DDD1] bg-white p-5 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#16A34A] bg-[rgba(22,163,74,0.10)] text-xl font-bold text-[#16A34A]">
          ✓
        </div>
        <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold italic text-[#1D1108]">
          Fotos enviadas!
        </p>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#8A6B55]">
          {statusMessage}
        </p>
        <div className="mt-5 rounded-xl border border-[#E8DDD1] bg-[#F4EDE1] px-4 py-3">
          <p className="text-[9px] uppercase tracking-wide text-[#8A6B55]">
            Status
          </p>
          <p className="mt-1 text-sm font-bold text-[#D4562B]">
            Aguardando moderação
          </p>
        </div>
        <button
          className="mt-5 h-11 w-full rounded-xl border border-[#E8DDD1] text-sm font-bold text-[#1D1108]"
          onClick={() => {
            setStatus("idle");
            setStatusMessage("");
          }}
          type="button"
        >
          + Enviar mais fotos
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-6 rounded-2xl border border-[#E8DDD1] bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="text-sm font-bold text-[#1D1108]">Nome/apelido</span>
        <input
          className="mt-2 h-11 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-base text-[#1D1108] outline-none focus:border-[#D4562B]"
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Como voce quer aparecer no telao"
          required
          value={guestName}
        />
      </label>

      <label className="block rounded-xl border border-[#E8DDD1] bg-[#F4EDE1] p-4">
        <span className="flex items-start gap-3">
          <input
            checked={acceptedTerms}
            className="mt-1 accent-[#D4562B]"
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-bold text-[#1D1108]">
              Autorizacao
            </span>
            <span className="mt-1 block text-sm leading-6 text-[#8A6B55]">
              {authorizationText}
            </span>
          </span>
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-bold text-[#1D1108]">Fotos</span>
        <input
          accept="image/*"
          className="mt-2 block w-full rounded-xl border border-dashed border-[#E8DDD1] bg-[#F4EDE1] p-4 text-sm text-[#8A6B55] file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4562B] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          type="file"
        />
        <span className="mt-2 block text-xs text-[#8A6B55]">
          Ate 15 fotos por envio, com limite de 20 MB por foto.
        </span>
      </label>

      {photos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {photos.map((photo) => (
            <article
              className="overflow-hidden rounded-xl border border-[#E8DDD1]"
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
                  <span className="text-xs font-semibold text-[#8A6B55]">
                    Mensagem opcional
                  </span>
                  <textarea
                    className="mt-1 min-h-16 w-full resize-none rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 py-2 text-sm text-[#1D1108] outline-none focus:border-[#D4562B]"
                    maxLength={MAX_MESSAGE_LENGTH}
                    onChange={(event) =>
                      updateMessage(photo.id, event.target.value)
                    }
                    value={photo.message}
                  />
                  <span className="mt-1 block text-right text-xs text-[#B09585]">
                    {photo.message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </label>
                <button
                  className="text-sm font-semibold text-[#D4562B]"
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
              ? "text-sm font-semibold text-[#DC2626]"
              : "text-sm font-semibold text-[#16A34A]"
          }
        >
          {statusMessage}
        </p>
      ) : null}

      <button
        className="h-12 w-full rounded-xl bg-[#D4562B] px-4 text-sm font-bold text-white transition hover:bg-[#BA4620] disabled:cursor-not-allowed disabled:bg-[#C0A898]"
        disabled={!canSubmit}
        type="submit"
      >
        {status === "submitting" ? "Enviando..." : "Enviar fotos"}
      </button>
    </form>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";

const MAX_FILES = 15;
const MAX_MESSAGE_LENGTH = 120;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2000;
const JPEG_QUALITY = 0.82;

type SelectedPhoto = {
  file: File;
  id: string;
  message: string;
  originalName: string;
  originalSize: number;
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

    return window.localStorage.getItem(`eventoon:${eventSlug}:acceptedTerms`) === "true";
  });
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [status, setStatus] = useState<"idle" | "preparing" | "submitting" | "success" | "error">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState("");

  const canSubmit = useMemo(
    () =>
      guestName.trim().length > 0 &&
      acceptedTerms &&
      photos.length > 0 &&
      status !== "preparing" &&
      status !== "submitting",
    [acceptedTerms, guestName, photos.length, status],
  );

  async function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextFiles = Array.from(files);

    if (photos.length + nextFiles.length > MAX_FILES) {
      setStatus("error");
      setStatusMessage(`Envie no máximo ${MAX_FILES} fotos por vez.`);
      return;
    }

    if (nextFiles.some((file) => !file.type.startsWith("image/"))) {
      setStatus("error");
      setStatusMessage("Escolha apenas arquivos de imagem.");
      return;
    }

    if (nextFiles.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
      setStatus("error");
      setStatusMessage("Cada foto pode ter no máximo 20 MB.");
      return;
    }

    setStatus("preparing");
    setStatusMessage("Preparando fotos para envio...");

    try {
      const prepared = await Promise.all(
        nextFiles.map(async (file) => {
          const optimizedFile = await optimizeImageForUpload(file);

          return {
            file: optimizedFile,
            id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
            message: "",
            originalName: file.name,
            originalSize: file.size,
            previewUrl: URL.createObjectURL(optimizedFile),
          };
        }),
      );

      setPhotos((current) => [...current, ...prepared]);
      setStatus("idle");
      setStatusMessage("");
    } catch {
      setStatus("error");
      setStatusMessage("Não foi possível preparar uma das fotos. Tente enviar menos imagens por vez.");
    }
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

    try {
      let uploaded = 0;

      for (const [index, photo] of photos.entries()) {
        setStatusMessage(`Enviando foto ${index + 1} de ${photos.length}...`);

        const formData = new FormData();
        formData.append("guestName", guestName.trim());
        formData.append("photos", photo.file);
        formData.append("message_0", photo.message.trim());

        const response = await fetch(`/api/events/${eventSlug}/photos`, {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as { error?: string; uploaded?: number };

        if (!response.ok) {
          throw new Error(payload.error ?? "Não foi possível enviar agora.");
        }

        uploaded += payload.uploaded ?? 1;
      }

      window.localStorage.setItem(`eventoon:${eventSlug}:guestName`, guestName.trim());
      window.localStorage.setItem(`eventoon:${eventSlug}:acceptedTerms`, "true");
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPhotos([]);
      setStatus("success");
      setStatusMessage(
        `${uploaded} ${uploaded === 1 ? "foto enviada" : "fotos enviadas"} para moderação.`,
      );
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar agora. Tente novamente com menos fotos.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 rounded-2xl border border-[#E8DDD1] bg-white p-5 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#16A34A] bg-[rgba(22,163,74,0.10)] text-xl font-bold text-[#16A34A]">
          ✓
        </div>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold italic">
          Fotos recebidas
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#8A6B55]">
          {statusMessage}
        </p>
        <button
          className="mt-5 h-11 w-full rounded-xl border border-[#E8DDD1] text-sm font-bold text-[#1D1108]"
          onClick={() => {
            setStatus("idle");
            setStatusMessage("");
          }}
          type="button"
        >
          Enviar mais fotos
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-6 rounded-2xl border border-[#E8DDD1] bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <label className="block rounded-2xl border-2 border-[#D4562B] bg-[rgba(212,86,43,0.07)] p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4562B]">
          Primeiro passo
        </span>
        <span className="mt-1 block text-base font-bold text-[#1D1108]">
          Digite seu nome ou apelido
        </span>
        <span className="mt-1 block text-sm leading-5 text-[#8A6B55]">
          Esse nome aparece junto com suas fotos no telão.
        </span>
        <input
          autoComplete="name"
          className="mt-3 h-12 w-full rounded-xl border border-[#D4562B] bg-white px-4 text-lg font-semibold text-[#1D1108] outline-none focus:border-[#1D1108] focus:ring-2 focus:ring-[rgba(212,86,43,0.18)]"
          onChange={(event) => setGuestName(event.target.value)}
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
            <span className="block text-sm font-bold text-[#1D1108]">Autorização</span>
            <span className="mt-1 block text-sm leading-6 text-[#8A6B55]">
              {authorizationText}
            </span>
          </span>
        </span>
      </label>

      <label className="block rounded-xl border border-dashed border-[#D4562B] bg-[rgba(212,86,43,0.08)] p-5 text-center">
        <span className="block text-sm font-bold text-[#1D1108]">
          Escolher fotos
        </span>
        <span className="mt-1 block text-xs leading-5 text-[#8A6B55]">
          Até {MAX_FILES} imagens por envio. Fotos grandes são reduzidas antes do upload.
        </span>
        <input
          accept="image/*"
          className="sr-only"
          disabled={status === "preparing" || status === "submitting"}
          multiple
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
          type="file"
        />
      </label>

      {photos.length > 0 ? (
        <div className="space-y-3">
          {photos.map((photo) => (
            <div
              className="grid gap-3 rounded-xl border border-[#E8DDD1] bg-[#FBF5EE] p-3"
              key={photo.id}
            >
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover"
                  src={photo.previewUrl}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1D1108]">
                    {photo.originalName}
                  </p>
                  <p className="mt-1 text-xs text-[#8A6B55]">
                    {formatBytes(photo.file.size)}
                    {photo.file.size < photo.originalSize
                      ? ` após otimização (${formatBytes(photo.originalSize)} original)`
                      : ""}
                  </p>
                  <button
                    className="mt-2 text-xs font-bold text-[#D4562B]"
                    disabled={status === "submitting"}
                    onClick={() => removePhoto(photo.id)}
                    type="button"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <input
                className="h-10 rounded-lg border border-[#E8DDD1] bg-white px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B]"
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(event) => updateMessage(photo.id, event.target.value)}
                placeholder="Mensagem opcional"
                value={photo.message}
              />
            </div>
          ))}
        </div>
      ) : null}

      {statusMessage ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-bold ${
            status === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-[#E8DDD1] bg-[#F4EDE1] text-[#8A6B55]"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}

      <button
        className="h-12 w-full rounded-xl bg-[#D4562B] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canSubmit}
        type="submit"
      >
        {status === "preparing"
          ? "Preparando fotos..."
          : status === "submitting"
            ? "Enviando..."
            : "Enviar para moderação"}
      </button>
    </form>
  );
}

async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));

  if (scale >= 1 && file.size <= 3 * 1024 * 1024) {
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, {
    lastModified: file.lastModified,
    type: "image/jpeg",
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Imagem inválida."));
    };
    image.src = url;
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

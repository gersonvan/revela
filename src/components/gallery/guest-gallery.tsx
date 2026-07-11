"use client";

import { useState } from "react";

const SELECTION_KEY_PREFIX = "revela:gallery-selection";

type GalleryPhoto = {
  guestName: string;
  id: string;
  imageUrl: string;
};

type GalleryResponse = {
  nextCursor: null | string;
  photos: GalleryPhoto[];
};

type GuestGalleryProps = {
  eventName: string;
  eventSlug: string;
  initialNextCursor: null | string;
  initialPhotos: GalleryPhoto[];
  primaryColor: string;
  totalPhotoCount: number;
};

export function GuestGallery({
  eventName,
  eventSlug,
  initialNextCursor,
  initialPhotos,
  primaryColor,
  totalPhotoCount,
}: GuestGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [initialSelection] = useState(() => loadStoredSelection(eventSlug));
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    () => new Set(initialSelection.selectedPhotoIds),
  );
  const [excludedPhotoIds, setExcludedPhotoIds] = useState<Set<string>>(
    () => new Set(initialSelection.excludedPhotoIds),
  );
  const [allPhotosSelected, setAllPhotosSelected] = useState(initialSelection.allPhotosSelected);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  function persistSelection(nextSelection: StoredSelection) {
    window.localStorage.setItem(
      `${SELECTION_KEY_PREFIX}:${eventSlug}`,
      JSON.stringify(nextSelection),
    );
  }

  function updateSelection(nextSelection: Set<string>) {
    setAllPhotosSelected(false);
    setExcludedPhotoIds(new Set());
    setSelectedPhotoIds(nextSelection);
    persistSelection({
      allPhotosSelected: false,
      excludedPhotoIds: [],
      selectedPhotoIds: [...nextSelection],
    });
  }

  function selectAllPhotos() {
    setAllPhotosSelected(true);
    setExcludedPhotoIds(new Set());
    setSelectedPhotoIds(new Set());
    persistSelection({ allPhotosSelected: true, excludedPhotoIds: [], selectedPhotoIds: [] });
  }

  function clearSelection() {
    updateSelection(new Set());
  }

  function togglePhoto(photoId: string) {
    if (allPhotosSelected) {
      const nextExcluded = new Set(excludedPhotoIds);

      if (nextExcluded.has(photoId)) {
        nextExcluded.delete(photoId);
      } else {
        nextExcluded.add(photoId);
      }

      setExcludedPhotoIds(nextExcluded);
      persistSelection({
        allPhotosSelected: true,
        excludedPhotoIds: [...nextExcluded],
        selectedPhotoIds: [],
      });
    } else {
      const nextSelection = new Set(selectedPhotoIds);

      if (nextSelection.has(photoId)) {
        nextSelection.delete(photoId);
      } else {
        nextSelection.add(photoId);
      }

      updateSelection(nextSelection);
    }
  }

  async function downloadSelection() {
    const selectedCount = getSelectedPhotoCount({
      allPhotosSelected,
      excludedPhotoIds,
      selectedPhotoIds,
      totalPhotoCount,
    });

    if (selectedCount === 0 || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(`/gallery/${eventSlug}/download`, {
        body: JSON.stringify({
          allApproved: allPhotosSelected,
          excludedPhotoIds: [...excludedPhotoIds],
          photoIds: [...selectedPhotoIds],
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Não foi possível preparar o ZIP.");
      }

      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      const fallbackName = `${eventSlug}-fotos.zip`;
      anchor.download = getDownloadFileName(response.headers.get("Content-Disposition")) ?? fallbackName;
      anchor.href = url;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Não foi possível preparar o ZIP.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/events/${eventSlug}/gallery?cursor=${nextCursor}`);

      if (!response.ok) {
        throw new Error("Não foi possível carregar mais fotos.");
      }

      const payload = (await response.json()) as GalleryResponse;
      setPhotos((current) => [...current, ...payload.photos]);
      setNextCursor(payload.nextCursor);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Não foi possível carregar mais fotos.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  const selectedCount = getSelectedPhotoCount({
    allPhotosSelected,
    excludedPhotoIds,
    selectedPhotoIds,
    totalPhotoCount,
  });

  return (
    <main className="min-h-screen bg-[#FBF5EE] text-[#1D1108]">
      <header className="border-b border-[#E8DDD1] bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-3xl italic" style={{ color: primaryColor }}>
              revela
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Fotos de {eventName}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#8A6B55]">
              Selecione suas favoritas. As prévias exibem uma marca d&apos;água de proteção.
            </p>
          </div>
          <div className="rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-4 py-3 text-sm">
            <strong className="text-[#1D1108]">{selectedCount}</strong>{" "}
            {selectedCount === 1 ? "foto selecionada" : "fotos selecionadas"}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {photos.length > 0 ? (
          <div className="mb-6 flex flex-col gap-3 border-b border-[#E8DDD1] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className="h-10 rounded-lg border border-[#1D1108] px-4 text-sm font-bold text-[#1D1108]"
                onClick={selectAllPhotos}
                type="button"
              >
                Selecionar todas ({totalPhotoCount})
              </button>
              {selectedCount > 0 ? (
                <button
                  className="h-10 rounded-lg px-4 text-sm font-bold"
                  onClick={clearSelection}
                  style={{ color: primaryColor }}
                  type="button"
                >
                  Limpar seleção
                </button>
              ) : null}
            </div>
            <button
              className="h-11 rounded-lg px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedCount === 0 || isDownloading}
              onClick={() => void downloadSelection()}
              style={{ backgroundColor: primaryColor }}
              type="button"
            >
              {isDownloading ? "Preparando ZIP..." : `Baixar ZIP (${selectedCount})`}
            </button>
          </div>
        ) : null}
        {photos.length === 0 ? (
          <div className="border border-[#E8DDD1] bg-white p-8 text-center text-sm text-[#8A6B55]">
            As fotos aprovadas aparecerão aqui.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const isSelected = allPhotosSelected
                ? !excludedPhotoIds.has(photo.id)
                : selectedPhotoIds.has(photo.id);

              return (
                <article
                  className={`overflow-hidden border bg-white ${
                    isSelected ? "border-2" : "border-[#E8DDD1]"
                  }`}
                  key={photo.id}
                  style={isSelected ? { borderColor: primaryColor } : undefined}
                >
                  <div className="relative aspect-square overflow-hidden bg-[#E8DDD1]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={`Foto enviada por ${photo.guestName}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={photo.imageUrl}
                    />
                    <Watermark eventName={eventName} />
                    <button
                      aria-pressed={isSelected}
                      className="absolute right-2 top-2 min-h-9 rounded-md bg-white/95 px-3 text-xs font-bold text-[#1D1108] shadow-sm"
                      onClick={() => togglePhoto(photo.id)}
                      type="button"
                    >
                      {isSelected ? "Selecionada" : "Selecionar"}
                    </button>
                  </div>
                  <p className="truncate px-3 py-2 text-xs font-semibold text-[#8A6B55]">
                    {photo.guestName}
                  </p>
                </article>
              );
            })}
          </div>
        )}

        {loadError ? <p className="mt-5 text-sm font-bold text-red-700">{loadError}</p> : null}
        {downloadError ? <p className="mt-5 text-sm font-bold text-red-700">{downloadError}</p> : null}
        {nextCursor ? (
          <div className="mt-8 text-center">
            <button
              className="h-11 rounded-lg border border-[#1D1108] px-5 text-sm font-bold text-[#1D1108] disabled:opacity-50"
              disabled={isLoadingMore}
              onClick={() => void loadMore()}
              type="button"
            >
              {isLoadingMore ? "Carregando..." : "Ver mais fotos"}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

type StoredSelection = {
  allPhotosSelected: boolean;
  excludedPhotoIds: string[];
  selectedPhotoIds: string[];
};

function loadStoredSelection(eventSlug: string): StoredSelection {
  const emptySelection = {
    allPhotosSelected: false,
    excludedPhotoIds: [],
    selectedPhotoIds: [],
  };

  if (typeof window === "undefined") {
    return emptySelection;
  }

  const storageKey = `${SELECTION_KEY_PREFIX}:${eventSlug}`;
  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return emptySelection;
  }

  try {
    const parsed = JSON.parse(storedValue) as StoredSelection | string[];

    if (Array.isArray(parsed)) {
      return { ...emptySelection, selectedPhotoIds: parsed };
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(storageKey);
    return emptySelection;
  }
}

function getSelectedPhotoCount({
  allPhotosSelected,
  excludedPhotoIds,
  selectedPhotoIds,
  totalPhotoCount,
}: {
  allPhotosSelected: boolean;
  excludedPhotoIds: Set<string>;
  selectedPhotoIds: Set<string>;
  totalPhotoCount: number;
}) {
  return allPhotosSelected
    ? Math.max(0, totalPhotoCount - excludedPhotoIds.size)
    : selectedPhotoIds.size;
}

function getDownloadFileName(contentDisposition: null | string) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

function Watermark({ eventName }: { eventName: string }) {
  const label = `PRÉVIA ${eventName.toUpperCase()} NÃO AUTORIZADA`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-[-45%] flex rotate-[-35deg] flex-col justify-around opacity-70">
      {Array.from({ length: 7 }, (_, index) => (
        <p className="whitespace-nowrap text-center text-[11px] font-black tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] sm:text-sm" key={index}>
          {label} · {label} · {label}
        </p>
      ))}
    </div>
  );
}

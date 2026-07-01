"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

const MAX_VISIBLE_PHOTOS = 10;
const ROTATION_INTERVAL_MS = 10_000;

type FeedPhoto = {
  guestName: string;
  id: string;
  imageUrl: string;
  message: string | null;
  uploadedAt: string;
};

type LivePhotoFeedProps = {
  emptyFallback?: ReactNode;
  eventSlug: string;
  initialPhotos: FeedPhoto[];
};

type ScreenLayout = {
  grid: string;
  items: string[];
};

export function LivePhotoFeed({
  emptyFallback = null,
  eventSlug,
  initialPhotos,
}: LivePhotoFeedProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pageIndex, setPageIndex] = useState(0);
  const photoSignatureRef = useRef(createPhotoSignature(initialPhotos));

  useEffect(() => {
    let active = true;

    async function refreshPhotos() {
      try {
        const response = await fetch(`/api/events/${eventSlug}/approved-photos`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { photos: FeedPhoto[] };

        if (active) {
          const nextSignature = createPhotoSignature(payload.photos);

          if (nextSignature !== photoSignatureRef.current) {
            photoSignatureRef.current = nextSignature;
            setPageIndex(0);
          }

          setPhotos(payload.photos);
        }
      } catch {
        // Keep showing last loaded photos if connection oscillates.
      }
    }

    void refreshPhotos();

    const interval = window.setInterval(refreshPhotos, 1500);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [eventSlug]);

  const uniqueApprovedPhotos = useMemo(() => uniquePhotos(photos), [photos]);
  const photoPages = useMemo(
    () => paginatePhotos(uniqueApprovedPhotos),
    [uniqueApprovedPhotos],
  );

  useEffect(() => {
    if (photoPages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setPageIndex((currentPage) => (currentPage + 1) % photoPages.length);
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [photoPages.length]);

  const visiblePhotos = photoPages[pageIndex] ?? photoPages[0] ?? [];
  const layout = useMemo(
    () => getScreenLayout(visiblePhotos.length),
    [visiblePhotos.length],
  );

  if (visiblePhotos.length === 0) {
    return emptyFallback;
  }

  return (
    <div className={`grid h-screen gap-3 p-4 sm:gap-4 sm:p-6 ${layout.grid}`}>
      {visiblePhotos.map((photo, index) => (
        <PhotoTile
          className={layout.items[index] ?? ""}
          key={photo.id}
          photo={photo}
        />
      ))}
    </div>
  );
}

export function ScreenFullscreenButton() {
  return (
    <button
      className="absolute left-4 top-4 z-50 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-[#1D1108] shadow-lg ring-1 ring-black/10 hover:bg-white sm:left-6 sm:top-6"
      onClick={() => document.documentElement.requestFullscreen?.()}
      type="button"
    >
      Tela cheia
    </button>
  );
}

function PhotoTile({
  className,
  photo,
}: {
  className: string;
  photo: FeedPhoto;
}) {
  return (
    <article
      className={`relative isolate overflow-hidden rounded-xl bg-[#1D1108] shadow-lg ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        src={photo.imageUrl}
      />
      <div className="absolute inset-0 bg-black/25" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="relative z-10 h-full w-full object-contain"
        src={photo.imageUrl}
      />

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 to-transparent p-3 text-white sm:p-4">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold italic sm:text-base">
          {photo.guestName}
        </p>
        {photo.message ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/85 sm:text-sm">
            {photo.message}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function uniquePhotos(photos: FeedPhoto[]) {
  const seen = new Set<string>();
  return photos.filter((photo) => {
    if (seen.has(photo.id)) {
      return false;
    }

    seen.add(photo.id);
    return true;
  });
}

function createPhotoSignature(photos: FeedPhoto[]) {
  return photos.map((photo) => photo.id).join(":");
}

function paginatePhotos(photos: FeedPhoto[]) {
  if (photos.length <= MAX_VISIBLE_PHOTOS) {
    return [photos];
  }

  const pageCount = Math.ceil(photos.length / MAX_VISIBLE_PHOTOS);
  const baseSize = Math.floor(photos.length / pageCount);
  const extraItems = photos.length % pageCount;
  const pages: FeedPhoto[][] = [];
  let cursor = 0;

  for (let page = 0; page < pageCount; page += 1) {
    const pageSize = baseSize + (page < extraItems ? 1 : 0);
    pages.push(photos.slice(cursor, cursor + pageSize));
    cursor += pageSize;
  }

  return pages;
}

function getScreenLayout(count: number): ScreenLayout {
  if (count === 1) {
    return {
      grid: "grid-cols-1 grid-rows-1",
      items: [""],
    };
  }

  if (count === 2) {
    return {
      grid: "grid-cols-2 grid-rows-1",
      items: ["", ""],
    };
  }

  if (count === 3) {
    return {
      grid: "grid-cols-3 grid-rows-2",
      items: ["col-span-2 row-span-2", "", ""],
    };
  }

  if (count === 4) {
    return {
      grid: "grid-cols-2 grid-rows-2",
      items: ["", "", "", ""],
    };
  }

  if (count <= 6) {
    return {
      grid: "grid-cols-3 grid-rows-2",
      items: ["col-span-2 row-span-2", "", "", "", "", ""].slice(0, count),
    };
  }

  if (count <= 8) {
    return {
      grid: "grid-cols-4 grid-rows-3",
      items: ["col-span-2 row-span-2", "", "", "", "", "", "", ""].slice(
        0,
        count,
      ),
    };
  }

  return {
    grid: "grid-cols-4 grid-rows-3",
    items: [
      "col-span-2 row-span-2",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ].slice(0, count),
  };
}

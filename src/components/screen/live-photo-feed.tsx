"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

const MAX_VISIBLE_PHOTOS = 10;
const ROTATION_INTERVAL_MS = 10_000;
const NEW_PHOTO_SPOTLIGHT_MS = 7_000;

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
  const [spotlightPhoto, setSpotlightPhoto] = useState<FeedPhoto | null>(null);
  const knownPhotoIdsRef = useRef(new Set(initialPhotos.map((photo) => photo.id)));

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
          const uniquePayloadPhotos = uniquePhotos(payload.photos);
          const newPhotos = uniquePayloadPhotos.filter(
            (photo) => !knownPhotoIdsRef.current.has(photo.id),
          );

          knownPhotoIdsRef.current = new Set(
            uniquePayloadPhotos.map((photo) => photo.id),
          );

          if (newPhotos.length > 0) {
            setPageIndex(0);
            setSpotlightPhoto(newPhotos[0]);
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

  useEffect(() => {
    if (!spotlightPhoto) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSpotlightPhoto(null);
    }, NEW_PHOTO_SPOTLIGHT_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [spotlightPhoto]);

  const uniqueApprovedPhotos = useMemo(() => uniquePhotos(photos), [photos]);
  const photoPages = useMemo(
    () => paginatePhotos(uniqueApprovedPhotos),
    [uniqueApprovedPhotos],
  );

  useEffect(() => {
    if (photoPages.length <= 1 || spotlightPhoto) {
      return;
    }

    const interval = window.setInterval(() => {
      setPageIndex((currentPage) => (currentPage + 1) % photoPages.length);
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [photoPages.length, spotlightPhoto]);

  const visiblePhotos = photoPages[pageIndex] ?? photoPages[0] ?? [];

  if (visiblePhotos.length === 0) {
    return emptyFallback;
  }

  return (
    <AnimatePresence mode="wait">
      {spotlightPhoto ? (
        <NewPhotoScene key={`new-${spotlightPhoto.id}`} photo={spotlightPhoto} />
      ) : (
        <MosaicScene
          key={`page-${pageIndex}-${visiblePhotos.map((photo) => photo.id).join("-")}`}
          photos={visiblePhotos}
        />
      )}
    </AnimatePresence>
  );
}

export function ScreenFullscreenButton() {
  return (
    <button
      className="absolute right-4 top-4 z-50 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-[#1D1108] shadow-lg ring-1 ring-black/10 hover:bg-white sm:right-6 sm:top-6"
      onClick={() => document.documentElement.requestFullscreen?.()}
      type="button"
    >
      Tela cheia
    </button>
  );
}

function NewPhotoScene({ photo }: { photo: FeedPhoto }) {
  return (
    <motion.section
      animate={{ opacity: 1, scale: 1 }}
      className="relative h-screen overflow-hidden bg-[#1D1108] p-6 text-white"
      exit={{ opacity: 0, scale: 0.98 }}
      initial={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <PhotoBackdrop imageUrl={photo.imageUrl} intensity="strong" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-6 top-6 z-20 rounded-full bg-white/15 px-5 py-2 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-md"
        initial={{ opacity: 0, y: -12 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Nova foto no telão
      </motion.div>

      <div className="relative z-10 flex h-full items-center justify-center">
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative h-[84vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-black/35 shadow-2xl ring-1 ring-white/15"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ delay: 0.15, duration: 0.75, ease: "easeOut" }}
        >
          <motion.img
            alt=""
            animate={{ scale: 1.04 }}
            className="h-full w-full object-contain"
            initial={{ scale: 1 }}
            src={photo.imageUrl}
            transition={{ duration: 6.6, ease: "easeOut" }}
          />

          <PhotoCaption photo={photo} size="large" />
        </motion.div>
      </div>
    </motion.section>
  );
}

function MosaicScene({ photos }: { photos: FeedPhoto[] }) {
  const layout = getScreenLayout(photos.length);

  return (
    <motion.section
      animate={{ opacity: 1 }}
      className={`grid h-screen gap-3 p-4 sm:gap-4 sm:p-6 ${layout.grid}`}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {photos.map((photo, index) => (
        <PhotoTile
          className={layout.items[index] ?? ""}
          index={index}
          key={photo.id}
          photo={photo}
          priority={index === 0}
        />
      ))}
    </motion.section>
  );
}

function PhotoTile({
  className,
  index,
  photo,
  priority,
}: {
  className: string;
  index: number;
  photo: FeedPhoto;
  priority: boolean;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`relative isolate overflow-hidden rounded-xl bg-[#1D1108] shadow-lg ${className}`}
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      layout
      transition={{
        delay: Math.min(index * 0.06, 0.36),
        duration: 0.55,
        ease: "easeOut",
        layout: { duration: 0.65 },
      }}
    >
      <PhotoBackdrop imageUrl={photo.imageUrl} intensity="soft" />

      <motion.img
        alt=""
        animate={priority ? { scale: 1.035 } : { scale: 1 }}
        className="relative z-10 h-full w-full object-contain"
        initial={{ scale: 1 }}
        src={photo.imageUrl}
        transition={
          priority
            ? { duration: 9, ease: "easeOut", repeat: Infinity, repeatType: "mirror" }
            : { duration: 0.6 }
        }
      />

      <PhotoCaption photo={photo} size={priority ? "large" : "normal"} />
    </motion.article>
  );
}

function PhotoBackdrop({
  imageUrl,
  intensity,
}: {
  imageUrl: string;
  intensity: "soft" | "strong";
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full scale-110 object-cover blur-2xl ${
          intensity === "strong" ? "opacity-70" : "opacity-40"
        }`}
        src={imageUrl}
      />
      <div
        className={`absolute inset-0 ${
          intensity === "strong" ? "bg-black/45" : "bg-black/25"
        }`}
      />
    </>
  );
}

function PhotoCaption({
  photo,
  size,
}: {
  photo: FeedPhoto;
  size: "large" | "normal";
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3 text-white sm:p-4"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.25, duration: 0.45 }}
    >
      <p
        className={`font-[family-name:var(--font-display)] font-semibold italic ${
          size === "large" ? "text-2xl sm:text-4xl" : "text-sm sm:text-base"
        }`}
      >
        {photo.guestName}
      </p>
      {photo.message ? (
        <p
          className={`mt-1 line-clamp-2 leading-5 text-white/85 ${
            size === "large" ? "text-base sm:text-xl" : "text-xs sm:text-sm"
          }`}
        >
          {photo.message}
        </p>
      ) : null}
    </motion.div>
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
      grid: "grid-cols-4 grid-rows-3",
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
    grid: count === 10 ? "grid-cols-5 grid-rows-3" : "grid-cols-4 grid-rows-3",
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

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

const MAX_VISIBLE_PHOTOS = 10;
const SCENE_INTERVAL_MS = 10_000;
const NEW_PHOTO_SPOTLIGHT_MS = 7_000;

type FeedPhoto = {
  guestName: string;
  id: string;
  imageUrl: string;
  message: string | null;
  uploadedAt: string;
};

type SceneMode = "featured" | "mosaic" | "qr";

type LivePhotoFeedProps = {
  emptyFallback?: ReactNode;
  eventName: string;
  eventSlug: string;
  initialPhotos: FeedPhoto[];
  qrCodeDataUrl: string;
};

type ScreenLayout = {
  grid: string;
  items: string[];
};

export function LivePhotoFeed({
  emptyFallback = null,
  eventName,
  eventSlug,
  initialPhotos,
  qrCodeDataUrl,
}: LivePhotoFeedProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pageIndex, setPageIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [spotlightQueue, setSpotlightQueue] = useState<FeedPhoto[]>([]);
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
            setSceneIndex(0);
            setSpotlightQueue((currentQueue) =>
              uniquePhotos([...currentQueue, ...newPhotos]),
            );
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

  const spotlightPhoto = spotlightQueue[0] ?? null;

  useEffect(() => {
    if (!spotlightPhoto) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSpotlightQueue((currentQueue) => currentQueue.slice(1));
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
  const sceneModes = useMemo(
    () => getSceneModes(uniqueApprovedPhotos.length),
    [uniqueApprovedPhotos.length],
  );

  useEffect(() => {
    if (spotlightPhoto || uniqueApprovedPhotos.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setSceneIndex((currentScene) => {
        const nextScene = (currentScene + 1) % sceneModes.length;

        if (sceneModes[nextScene] === "mosaic" && photoPages.length > 1) {
          setPageIndex((currentPage) => (currentPage + 1) % photoPages.length);
        }

        return nextScene;
      });
    }, SCENE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    photoPages.length,
    sceneModes,
    spotlightPhoto,
    uniqueApprovedPhotos.length,
  ]);

  const visiblePhotos = photoPages[pageIndex] ?? photoPages[0] ?? [];
  const sceneMode = sceneModes[sceneIndex % sceneModes.length] ?? "featured";

  if (visiblePhotos.length === 0) {
    return emptyFallback;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {spotlightPhoto ? (
          <NewPhotoScene key={`new-${spotlightPhoto.id}`} photo={spotlightPhoto} />
        ) : sceneMode === "qr" ? (
          <QrCallScene
            eventName={eventName}
            key={`qr-${pageIndex}`}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        ) : sceneMode === "featured" ? (
          <FeaturedScene
            key={`featured-${visiblePhotos.map((photo) => photo.id).join("-")}`}
            photos={visiblePhotos}
          />
        ) : (
          <MosaicScene
            key={`mosaic-${pageIndex}-${visiblePhotos
              .map((photo) => photo.id)
              .join("-")}`}
            photos={visiblePhotos}
          />
        )}
      </AnimatePresence>

      {photoPages.length > 1 || sceneModes.length > 1 ? (
        <SceneProgress
          activeIndex={sceneIndex % sceneModes.length}
          pageCount={photoPages.length}
          pageIndex={pageIndex}
          sceneCount={sceneModes.length}
        />
      ) : null}
    </>
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
      <CelebrationGlow />

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
          layoutId={`photo-${photo.id}`}
          transition={{ delay: 0.15, duration: 0.75, ease: "easeOut" }}
        >
          <motion.img
            alt=""
            animate={{ scale: 1.05, x: "1.5%", y: "-1%" }}
            className="h-full w-full object-contain"
            initial={{ scale: 1, x: 0, y: 0 }}
            src={photo.imageUrl}
            transition={{ duration: 6.6, ease: "easeOut" }}
          />

          <PhotoCaption photo={photo} size="large" />
        </motion.div>
      </div>
    </motion.section>
  );
}

function FeaturedScene({ photos }: { photos: FeedPhoto[] }) {
  const featuredPhoto = photos[0];
  const sidePhotos = photos.slice(1, 7);

  return (
    <motion.section
      animate={{ opacity: 1, x: 0 }}
      className="grid h-screen grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] gap-4 p-6"
      exit={{ opacity: 0, x: -36 }}
      initial={{ opacity: 0, x: 36 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      <motion.article
        className="relative isolate overflow-hidden rounded-2xl bg-[#1D1108] shadow-2xl"
        layoutId={`photo-${featuredPhoto.id}`}
      >
        <PhotoBackdrop imageUrl={featuredPhoto.imageUrl} intensity="strong" />
        <motion.img
          alt=""
          animate={{ scale: 1.045, x: "1.25%", y: "-1%" }}
          className="relative z-10 h-full w-full object-contain"
          initial={{ scale: 1, x: 0, y: 0 }}
          src={featuredPhoto.imageUrl}
          transition={{
            duration: 9,
            ease: "easeOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <PhotoCaption photo={featuredPhoto} size="large" />
      </motion.article>

      <div className="grid min-h-0 grid-cols-2 gap-4">
        {sidePhotos.map((photo, index) => (
          <PhotoTile
            className={sidePhotos.length <= 2 ? "row-span-2" : ""}
            index={index}
            key={photo.id}
            photo={photo}
            priority={false}
            transitionStyle="cascade"
          />
        ))}
      </div>
    </motion.section>
  );
}

function MosaicScene({ photos }: { photos: FeedPhoto[] }) {
  const layout = getScreenLayout(photos.length);
  const transitionStyle = photos.length % 2 === 0 ? "zoom" : "slide";

  return (
    <motion.section
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`grid h-screen gap-3 p-4 sm:gap-4 sm:p-6 ${layout.grid}`}
      exit={{ opacity: 0, scale: 0.98, y: -18 }}
      initial={{ opacity: 0, scale: 1.01, y: 18 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {photos.map((photo, index) => (
        <PhotoTile
          className={layout.items[index] ?? ""}
          index={index}
          key={photo.id}
          photo={photo}
          priority={index === 0}
          transitionStyle={transitionStyle}
        />
      ))}
    </motion.section>
  );
}

function QrCallScene({
  eventName,
  qrCodeDataUrl,
}: {
  eventName: string;
  qrCodeDataUrl: string;
}) {
  return (
    <motion.section
      animate={{ opacity: 1 }}
      className="relative flex h-screen items-center justify-center overflow-hidden bg-[#1D1108] p-8 text-white"
      exit={{ opacity: 0, scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        className="absolute h-[78vmin] w-[78vmin] rounded-full border border-white/10"
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.52, 0.3] }}
        className="absolute h-[58vmin] w-[58vmin] rounded-full bg-[#D4562B]/30 blur-3xl"
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_360px]">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -32 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold italic">
            {eventName}
          </p>
          <h2 className="mt-5 max-w-3xl text-6xl font-black leading-none">
            Sua foto pode ser a próxima
          </h2>
          <p className="mt-6 max-w-2xl text-2xl leading-9 text-white/75">
            Aponte a câmera, envie sua foto e participe do telão ao vivo.
          </p>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl bg-white p-7 text-center text-[#1D1108] shadow-2xl"
          initial={{ opacity: 0, scale: 0.78, y: 24 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="QR Code do evento" className="mx-auto h-72 w-72" src={qrCodeDataUrl} />
          <p className="mt-5 text-xl font-black">Envie suas fotos</p>
        </motion.div>
      </div>
    </motion.section>
  );
}

function PhotoTile({
  className,
  index,
  photo,
  priority,
  transitionStyle,
}: {
  className: string;
  index: number;
  photo: FeedPhoto;
  priority: boolean;
  transitionStyle: "cascade" | "slide" | "zoom";
}) {
  const initialState =
    transitionStyle === "slide"
      ? { opacity: 0, scale: 0.98, x: index % 2 === 0 ? -22 : 22, y: 10 }
      : transitionStyle === "zoom"
        ? { opacity: 0, scale: 0.9, x: 0, y: 0 }
        : { opacity: 0, scale: 0.96, x: 0, y: 18 };

  return (
    <motion.article
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      className={`relative isolate overflow-hidden rounded-xl bg-[#1D1108] shadow-lg ${className}`}
      initial={initialState}
      layout
      layoutId={`photo-${photo.id}`}
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
        animate={
          priority
            ? { scale: 1.035, x: "1%", y: "-0.75%" }
            : { scale: 1, x: 0, y: 0 }
        }
        className="relative z-10 h-full w-full object-contain"
        initial={{ scale: 1, x: 0, y: 0 }}
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
      <motion.img
        alt=""
        animate={{ scale: intensity === "strong" ? 1.16 : 1.12, x: "-1.5%" }}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full scale-110 object-cover blur-2xl ${
          intensity === "strong" ? "opacity-70" : "opacity-40"
        }`}
        src={imageUrl}
        transition={{
          duration: 11,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
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

function CelebrationGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {[0, 1, 2, 3, 4].map((item) => (
        <motion.span
          animate={{
            opacity: [0, 0.7, 0],
            scale: [0.7, 1.5, 2.1],
            y: ["12vh", "-8vh"],
          }}
          className="absolute h-24 w-24 rounded-full border border-white/30"
          initial={{ opacity: 0 }}
          key={item}
          style={{
            left: `${16 + item * 16}%`,
            top: `${20 + (item % 2) * 34}%`,
          }}
          transition={{
            delay: item * 0.22,
            duration: 2.4,
            ease: "easeOut",
            repeat: 2,
          }}
        />
      ))}
    </div>
  );
}

function SceneProgress({
  activeIndex,
  pageCount,
  pageIndex,
  sceneCount,
}: {
  activeIndex: number;
  pageCount: number;
  pageIndex: number;
  sceneCount: number;
}) {
  return (
    <div className="pointer-events-none absolute bottom-5 left-6 z-50 flex items-center gap-2">
      {Array.from({ length: sceneCount }).map((_, index) => (
        <span
          className={`h-1.5 rounded-full transition-all ${
            index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/35"
          }`}
          key={index}
        />
      ))}
      {pageCount > 1 ? (
        <span className="ml-2 rounded-full bg-black/35 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur">
          {pageIndex + 1}/{pageCount}
        </span>
      ) : null}
    </div>
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

function getSceneModes(photoCount: number): SceneMode[] {
  if (photoCount <= 2) {
    return ["featured", "qr"];
  }

  return ["featured", "mosaic", "qr", "mosaic"];
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

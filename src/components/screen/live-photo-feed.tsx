"use client";

import { useEffect, useMemo, useState } from "react";

type FeedPhoto = {
  guestName: string;
  id: string;
  imageUrl: string;
  message: string | null;
  uploadedAt: string;
};

type LivePhotoFeedProps = {
  eventSlug: string;
  initialPhotos: FeedPhoto[];
};

export function LivePhotoFeed({ eventSlug, initialPhotos }: LivePhotoFeedProps) {
  const [photos, setPhotos] = useState(initialPhotos);

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
          setPhotos(payload.photos);
        }
      } catch {
        // Keep showing the last loaded photos if the connection oscillates.
      }
    }

    void refreshPhotos();

    const interval = window.setInterval(refreshPhotos, 1500);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [eventSlug]);

  const mixedPhotos = useMemo(() => mixPhotos(photos), [photos]);

  if (mixedPhotos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid h-screen grid-cols-4 auto-rows-fr gap-4 p-6">
        {mixedPhotos.slice(0, 12).map((photo, index) => (
          <article
            className={
              index === 0
                ? "relative col-span-2 row-span-2 overflow-hidden rounded-2xl bg-black shadow-lg"
                : "relative overflow-hidden rounded-2xl bg-black shadow-lg"
            }
            key={photo.id}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="h-full w-full object-cover"
              src={photo.imageUrl}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <p className="font-[family-name:var(--font-display)] text-base font-semibold italic">
                {photo.guestName}
              </p>
              {photo.message ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/85">
                  {photo.message}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <button
        className="absolute left-6 top-6 rounded-xl bg-white/90 px-4 py-2 text-sm font-bold text-[#1D1108] shadow-md transition hover:bg-white"
        onClick={() => document.documentElement.requestFullscreen?.()}
        type="button"
      >
        Tela cheia
      </button>
    </>
  );
}

function mixPhotos(photos: FeedPhoto[]) {
  if (photos.length <= 4) {
    return photos;
  }

  const recent = photos.slice(0, 6);
  const older = photos.slice(6);

  return recent.flatMap((photo, index) => {
    const olderPhoto = older[(index * 3) % older.length];
    return olderPhoto ? [photo, olderPhoto] : [photo];
  });
}

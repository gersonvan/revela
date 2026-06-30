"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ModerationSummary = {
  counts: Record<string, number | undefined>;
  latestPendingAt: string | null;
  latestPendingId: string | null;
};

type ModerationAutoRefreshProps = {
  initialLatestPendingId: string | null;
  token: string;
};

export function ModerationAutoRefresh({
  initialLatestPendingId,
  token,
}: ModerationAutoRefreshProps) {
  const router = useRouter();
  const latestPendingIdRef = useRef(initialLatestPendingId);
  const [hasNewPhotos, setHasNewPhotos] = useState(false);

  useEffect(() => {
    let active = true;

    async function refreshSummary() {
      try {
        const response = await fetch(`/api/moderate/${token}/summary`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const summary = (await response.json()) as ModerationSummary;
        const latestPendingId = summary.latestPendingId;

        if (!active || !latestPendingId) {
          return;
        }

        if (!latestPendingIdRef.current) {
          latestPendingIdRef.current = latestPendingId;
          router.refresh();
          return;
        }

        if (latestPendingId !== latestPendingIdRef.current) {
          latestPendingIdRef.current = latestPendingId;
          setHasNewPhotos(true);
          router.refresh();
        }
      } catch {
        // Keep the current list visible if polling fails.
      }
    }

    const interval = window.setInterval(refreshSummary, 4000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [router, token]);

  if (!hasNewPhotos) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-[#d7cfc1] bg-white p-3 text-sm font-semibold text-[#9a5a44]">
      Novas fotos chegaram para moderacao.
    </div>
  );
}

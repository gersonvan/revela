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

void refreshSummary();

const interval = window.setInterval(refreshSummary, 1500);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [router, token]);

  if (!hasNewPhotos) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-[rgba(212,86,43,0.3)] bg-[rgba(212,86,43,0.08)] px-4 py-3 text-sm font-bold text-[#D4562B]">
      Novas fotos chegaram para moderação.
    </div>
  );
}

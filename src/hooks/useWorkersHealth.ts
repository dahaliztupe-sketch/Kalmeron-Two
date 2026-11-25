"use client";

import { useEffect, useState } from "react";

export type WorkerStatus = "ok" | "warming_up" | "unreachable" | "degraded";

/**
 * Client view of the Python sidecars' health, via the existing
 * `/api/health/workers` route (30s server-side cache).
 *
 * Returns `null` while the check is in flight or when it fails.
 * Callers should treat `null` as "unknown" and keep the UI enabled,
 * since each feature already fails gracefully on its own.
 */
export function useWorkersHealth(): Record<string, WorkerStatus> | null {
  const [workers, setWorkers] = useState<Record<string, WorkerStatus> | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/health/workers", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!mounted || !j) return;
        const map: Record<string, WorkerStatus> = {};
        for (const w of j.workers ?? []) {
          if (w?.key) map[w.key as string] = w.status as WorkerStatus;
        }
        setWorkers(map);
      })
      .catch(() => {
        /* unknown - leave null */
      });
    return () => {
      mounted = false;
    };
  }, []);

  return workers;
}

/**
 * A sidecar counts as available only when the health check explicitly
 * reports it up. Unknown (null map / untracked key) stays enabled so a
 * flaky health endpoint never hides working UI.
 */
export function isWorkerUp(
  workers: Record<string, WorkerStatus> | null,
  key: string,
): boolean {
  if (!workers) return true;
  const s = workers[key];
  if (s === undefined) return true;
  return s === "ok" || s === "warming_up";
}

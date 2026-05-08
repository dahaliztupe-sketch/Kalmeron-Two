"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";

interface WorkerHealth {
  name: string;
  key: string;
  status: "ok" | "warming_up" | "unreachable" | "degraded";
}

interface WorkersResult {
  workers: WorkerHealth[];
  allOk: boolean;
  checkedAt: number;
}

const POLL_INTERVAL_MS = 60_000;
const DISMISS_STORAGE_KEY = "kalmeron_worker_guard_dismissed";

/** Worker keys that are relevant to a given page path prefix */
const PATH_WORKER_MAP: Array<{ pathPrefix: string; workerKeys: string[] }> = [
  { pathPrefix: "/chat", workerKeys: ["embeddingsWorker", "pdfWorker"] },
  { pathPrefix: "/egypt-calc", workerKeys: ["egyptCalc"] },
  { pathPrefix: "/pitch-practice", workerKeys: ["llmJudge"] },
  { pathPrefix: "/document", workerKeys: ["pdfWorker"] },
  { pathPrefix: "/rag", workerKeys: ["embeddingsWorker", "pdfWorker"] },
];

function getRelevantKeys(pathname: string): string[] {
  for (const entry of PATH_WORKER_MAP) {
    if (pathname.startsWith(entry.pathPrefix)) return entry.workerKeys;
  }
  return [];
}

interface Props {
  pathname: string;
}

export function WorkerHealthGuard({ pathname }: Props) {
  const [downWorkers, setDownWorkers] = useState<WorkerHealth[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const relevantKeys = getRelevantKeys(pathname);

  const checkHealth = useCallback(async (force = false) => {
    if (relevantKeys.length === 0) return;
    try {
      const url = force ? "/api/health/workers?force=1" : "/api/health/workers";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as WorkersResult;
      const down = data.workers.filter(
        (w) =>
          relevantKeys.includes(w.key) &&
          (w.status === "unreachable" || w.status === "degraded"),
      );
      setDownWorkers(down);
      if (down.length === 0) setDismissed(false);
    } catch {
    }
  }, [relevantKeys]);

  const handleRetry = useCallback(async () => {
    setRefreshing(true);
    setDismissed(false);
    try {
      await fetch("/api/health/workers", { method: "POST" });
      await checkHealth(true);
    } finally {
      setRefreshing(false);
    }
  }, [checkHealth]);

  useEffect(() => {
    void checkHealth();
    const t = setInterval(() => void checkHealth(), POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [checkHealth, pathname]);

  if (dismissed || downWorkers.length === 0) return null;

  const names = downWorkers.map((w) => w.name).join("، ");

  return (
    <div
      dir="rtl"
      role="alert"
      className="flex items-center gap-3 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-200"
    >
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
      <span className="flex-1">
        <span className="font-semibold">{names}</span>
        {" "}غير متاحة مؤقتاً — قد تكون النتائج أقل دقة حتى تعود الخدمة للعمل.
      </span>
      <button
        onClick={() => void handleRetry()}
        disabled={refreshing}
        className="flex items-center gap-1 text-amber-300 hover:text-amber-100 transition disabled:opacity-50"
        aria-label="إعادة المحاولة"
      >
        <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
        إعادة المحاولة
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-300 transition"
        aria-label="إغلاق"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";

interface VitalsMetric {
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  id: string;
}

/**
 * Reports Core Web Vitals to /api/analytics/vitals.
 * Mount once in root layout.
 */
export function WebVitals() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    (async () => {
      try {
        const wv = await import("web-vitals").catch(() => null);
        if (!wv || cancelled) return;

        const send = (metric: VitalsMetric) => {
          const payload = JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
            url: window.location.pathname,
            ts: Date.now(),
          });

          if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon("/api/analytics/vitals", blob);
          } else {
            fetch("/api/analytics/vitals", {
              method: "POST",
              body: payload,
              headers: { "Content-Type": "application/json" },
              keepalive: true,
            }).catch(() => {});
          }
        };

        wv.onCLS?.(send as (m: unknown) => void);
        wv.onFCP?.(send as (m: unknown) => void);
        wv.onLCP?.(send as (m: unknown) => void);
        wv.onINP?.(send as (m: unknown) => void);
        wv.onTTFB?.(send as (m: unknown) => void);
      } catch {
        // silent
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

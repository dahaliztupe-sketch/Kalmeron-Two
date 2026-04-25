"use client";

import { useEffect, useState } from "react";

interface SocialProof {
  founders: number;
  ideasAnalyzed: number;
  plansBuilt: number;
}

const FALLBACK: SocialProof = {
  founders: 1_000,
  ideasAnalyzed: 5_000,
  plansBuilt: 1_500,
};

function arabicNumber(n: number): string {
  // Group with thousands separators in Western digits — matches the rest of
  // the landing page numerals (the Arabic typography stack uses Western digits
  // for legibility against the dark hero gradient).
  return n.toLocaleString("en-US");
}

/**
 * Hero pill that used to read a hard-coded "+1000 entrepreneurs". Now fetches
 * `/api/social-proof` (cached server-side for 5 minutes) so the number reflects
 * real platform usage with floor minimums until live counts overtake them.
 *
 * Renders the floor instantly so first paint is never empty, then upgrades
 * to live numbers when the API responds.
 */
export function SocialProofLine() {
  const [data, setData] = useState<SocialProof>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/social-proof", { cache: "force-cache" });
        if (!res.ok) return;
        const json = (await res.json()) as Partial<SocialProof>;
        if (cancelled) return;
        setData({
          founders: Math.max(json.founders ?? 0, FALLBACK.founders),
          ideasAnalyzed: Math.max(json.ideasAnalyzed ?? 0, FALLBACK.ideasAnalyzed),
          plansBuilt: Math.max(json.plansBuilt ?? 0, FALLBACK.plansBuilt),
        });
      } catch {
        // Keep fallback — never break the hero on a network error.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      أكثر من <span className="font-bold text-white">{arabicNumber(data.founders)}</span>{" "}
      رائد أعمال بدأوا بنفس السؤال اللي في دماغك الآن، حلّلنا{" "}
      <span className="font-bold text-white">{arabicNumber(data.ideasAnalyzed)}</span> فكرة وبنينا{" "}
      <span className="font-bold text-white">{arabicNumber(data.plansBuilt)}</span> خطة عمل.
    </>
  );
}

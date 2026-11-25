"use client";

import { useEffect, useState } from "react";

interface SocialProof {
  founders: number;
  ideasAnalyzed: number;
  plansBuilt: number;
}

const EMPTY: SocialProof = {
  founders: 0,
  ideasAnalyzed: 0,
  plansBuilt: 0,
};

function arabicNumber(n: number): string {
  // Group with thousands separators in Western digits — matches the rest of
  // the landing page numerals (the Arabic typography stack uses Western digits
  // for legibility against the dark hero gradient).
  return n.toLocaleString("en-US");
}

/**
 * Hero pill showing real platform usage from `/api/social-proof` (cached
 * server-side for 5 minutes). Renders nothing until real usage exists —
 * no fabricated placeholder numbers.
 */
export function SocialProofLine() {
  const [data, setData] = useState<SocialProof>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/social-proof", { cache: "force-cache" });
        if (!res.ok) return;
        const json = (await res.json()) as Partial<SocialProof>;
        if (cancelled) return;
        setData({
          founders: json.founders ?? 0,
          ideasAnalyzed: json.ideasAnalyzed ?? 0,
          plansBuilt: json.plansBuilt ?? 0,
        });
      } catch {
        // Keep empty state — never break the hero on a network error.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing honest to show yet — render no pill instead of fake numbers.
  if (!data.founders) return null;

  return (
    <>
      أكثر من <span className="font-bold text-white">{arabicNumber(data.founders)}</span>{" "}
      رائد أعمال بدأوا بنفس السؤال اللي في دماغك الآن، حلّلنا{" "}
      <span className="font-bold text-white">{arabicNumber(data.ideasAnalyzed)}</span> فكرة وبنينا{" "}
      <span className="font-bold text-white">{arabicNumber(data.plansBuilt)}</span> خطة عمل.
    </>
  );
}

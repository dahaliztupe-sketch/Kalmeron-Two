"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/src/lib/utils";

type CreditsResp = {
  plan: string;
  planName: string;
  dailyBalance: number;
  monthlyBalance: number;
  rolledOverCredits: number;
  dailyLimit: number;
  monthlyLimit: number;
  unlimited: boolean;
  total: number;
};

export function CreditsIndicator() {
  const { user } = useAuth();
  const [data, setData] = useState<CreditsResp | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken().catch(() => null);
      if (!token) return;
      const res = await fetch("/api/user/credits", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as CreditsResp;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
    const id = setInterval(fetchCredits, 30_000);
    const onFocus = () => fetchCredits();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchCredits]);

  if (!user) return null;

  const unlimited = !!data?.unlimited;
  const total = data?.total ?? null;
  const low = !unlimited && total !== null && total < 50;
  const planName = data?.planName || "—";

  return (
    <Link
      href="/pricing"
      title={`خطتك: ${planName}`}
      className={cn(
        "hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
        low
          ? "border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
          : "border-white/10 bg-white/[0.04] text-white hover:border-brand-cyan/40 hover:text-brand-cyan"
      )}
    >
      <Coins className="h-3.5 w-3.5" />
      <span className="tabular-nums">
        {unlimited ? "∞" : loading && total === null ? "—" : total ?? "—"}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70">
        {planName}
      </span>
    </Link>
  );
}

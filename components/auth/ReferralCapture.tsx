"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "kalmeron_ref_code";
const STORAGE_TS = "kalmeron_ref_ts";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * Drop this anywhere on auth pages (signup/login). It captures `?ref=XXX`
 * from the URL and persists it to localStorage for 30 days, so the
 * referral code survives any redirect flow (OAuth, email verification, etc.)
 * before being POSTed to /api/referrals after signup completes.
 */
export function ReferralCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("ref");
    if (!code || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, code.toUpperCase());
      window.localStorage.setItem(STORAGE_TS, String(Date.now()));
    } catch {
      // ignore storage errors
    }
  }, [params]);

  return null;
}

/** Read the stored referral code if still valid. */
export function getStoredReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const code = window.localStorage.getItem(STORAGE_KEY);
    const ts = Number(window.localStorage.getItem(STORAGE_TS) || 0);
    if (!code) return null;
    if (Date.now() - ts > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_TS);
      return null;
    }
    return code;
  } catch {
    return null;
  }
}

/** Send the stored code to /api/referrals after a successful signup. */
export async function attributeReferralIfAny(idToken: string): Promise<boolean> {
  const code = getStoredReferralCode();
  if (!code) return false;
  try {
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(STORAGE_TS);
      } catch {
        // ignore
      }
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

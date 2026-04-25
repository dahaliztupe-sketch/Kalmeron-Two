"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export type AppLocale = "ar" | "en";

const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 365 * 24 * 60 * 60;

/**
 * Thin client-side wrapper around `next-intl`'s `useLocale`. Replaces the old
 * `useLanguage` context that read/wrote `localStorage` after hydration —
 * which caused a visible flicker on first paint because SSR rendered with the
 * default `ar` direction while the client switched to the saved locale only
 * after mount.
 *
 * The locale is now resolved server-side from the `NEXT_LOCALE` cookie via
 * `i18n/request.ts`, so the very first paint already has the correct `dir`
 * and `lang`. Switching languages writes the cookie and triggers a
 * `router.refresh()` so SSR re-renders with the new locale — no flicker.
 */
export function useAppLocale(): {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
} {
  const raw = useLocale();
  const router = useRouter();
  const locale: AppLocale = raw === "en" ? "en" : "ar";

  const setLocale = useCallback(
    (next: AppLocale) => {
      if (typeof document === "undefined") return;
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      // Reflect immediately for any UI that reads document.documentElement.
      document.documentElement.lang = next;
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      // Re-render the tree with the new server-resolved locale.
      router.refresh();
    },
    [router],
  );

  return { locale, setLocale };
}

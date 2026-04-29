"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "scroll_positions";
const MAX_ENTRIES = 50;

function getStore(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function savePosition(path: string, y: number) {
  try {
    const store = getStore();
    store[path] = y;
    const keys = Object.keys(store);
    if (keys.length > MAX_ENTRIES) {
      delete store[keys[0]];
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
  }
}

function getSavedPosition(path: string): number {
  return getStore()[path] ?? 0;
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevPathRef.current;

    if (prev && prev !== pathname) {
      savePosition(prev, window.scrollY);
    }

    prevPathRef.current = pathname;

    const saved = getSavedPosition(pathname);
    if (saved > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: "instant" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (prevPathRef.current) {
        savePosition(prevPathRef.current, window.scrollY);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return null;
}

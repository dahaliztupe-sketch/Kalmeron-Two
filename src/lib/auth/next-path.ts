/**
 * Post-auth redirect target helper.
 *
 * The site entry points (hero idea input, protected-page bounces in proxy.ts)
 * carry a `next` query param so users land back where they intended after
 * signing in. These helpers read and validate that param client-side.
 *
 * Validation: internal absolute paths only. Protocol-relative URLs
 * (//evil.com) and auth-page loops (/auth/*) are rejected.
 */
export function isSafeNextPath(next: string | null | undefined): next is string {
  return (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/auth/")
  );
}

/** Read the validated `next` param from the current URL (client-only; null on SSR). */
export function readSafeNextPath(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  return isSafeNextPath(next) ? next : null;
}

/** Append a validated `next` param to a path (used for login <-> signup cross-links). */
export function withNextParam(path: string, next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

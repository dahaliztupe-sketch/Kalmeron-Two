/**
 * Single source of truth for the public site URL.
 * Falls back to the real production URL. Set NEXT_PUBLIC_SITE_URL once a
 * custom domain is owned and connected.
 */
/** Contact address confirmed by the owner (2026-11-26). Personal Gmail until a project domain exists. */
export const CONTACT_EMAIL = "abdalrahman32008@gmail.com";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://kalmeron-two.vercel.app"
).replace(/\/+$/, "");

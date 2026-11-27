/**
 * Model ids for the founder flow (idea analysis and role agents).
 * The 2.5 ids are deprecated: Google's pricing page says that on 2026-12-01 requests to them are
 * routed to other models and billed at those rates. The defaults below come from that docs page and
 * are not yet verified by a live call, so they can be overridden by env without a code change.
 */
export const DEFAULT_GUEST_MODEL = "gemini-3.5-flash-lite";
export const DEFAULT_USER_MODEL = "gemini-3.8-flash";

const clean = (v: string | undefined): string | null => {
  const t = (v ?? "").trim();
  return /^[a-z0-9][a-z0-9._-]{2,60}$/i.test(t) ? t : null;
};

export function founderModel(isGuest: boolean, env: Record<string, string | undefined> = process.env): string {
  return isGuest
    ? (clean(env.KALMERON_GUEST_MODEL) ?? DEFAULT_GUEST_MODEL)
    : (clean(env.KALMERON_USER_MODEL) ?? DEFAULT_USER_MODEL);
}

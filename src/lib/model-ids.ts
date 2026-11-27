/**
 * One place for Gemini model ids.
 * gemini-2.5-flash and gemini-2.5-pro are deprecated: per Google's pricing page, on 2026-12-01 requests to
 * them are routed to gemini-3.5-flash-lite and gemini-3.8-flash and billed at those rates. These defaults
 * name the same targets explicitly. They come from the docs and are not call-verified, so each tier can be
 * overridden by env without a code change.
 */
export type ModelTier = "lite" | "flash" | "pro";

export const DEFAULT_MODEL_IDS: Record<ModelTier, string> = {
  lite: "gemini-3.5-flash-lite",
  flash: "gemini-3.5-flash-lite",
  pro: "gemini-3.8-flash",
};

const ENV_KEYS: Record<ModelTier, string> = {
  lite: "KALMERON_MODEL_LITE",
  flash: "KALMERON_MODEL_FLASH",
  pro: "KALMERON_MODEL_PRO",
};

const valid = (v: string | undefined): string | null => {
  const t = (v ?? "").trim();
  return /^[a-z0-9][a-z0-9._-]{2,60}$/i.test(t) ? t : null;
};

export function geminiModel(tier: ModelTier, env: Record<string, string | undefined> = process.env): string {
  return valid(env[ENV_KEYS[tier]]) ?? DEFAULT_MODEL_IDS[tier];
}

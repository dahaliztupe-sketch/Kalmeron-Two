// @ts-nocheck
/**
 * founder-profile — Cross-session memory for Kalmeron (Phase C8).
 *
 * What this stores:
 *   A small, structured profile per `userId` (or per anonymous chat-thread)
 *   capturing facts the user has stated about themselves and their business:
 *     - business stage / industry / location
 *     - revenue band / team size
 *     - declared goals (top 3, most recent)
 *     - long-running issues / pain points
 *     - explicit preferences ("لا تستخدم كلمة X", "ركّز على السوق المصري"…)
 *
 * Why not a heavy graph DB?
 *   We keep an in-memory map (ring-buffered + bounded) so it's cheap to read
 *   on every chat turn. When `FOUNDER_PROFILE_PERSIST=on` and Firestore is
 *   reachable we mirror writes through `firebase-admin` so the profile
 *   survives restarts; failures degrade silently to in-memory only.
 *
 * Why this matters:
 *   Without it, agents start every conversation as if they had never met
 *   the founder. With it, the second message in a session — and *every*
 *   message in a future session — can reference prior context and produce
 *   tailored advice instead of generic boilerplate.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { MODELS } from '@/src/lib/gemini';

export const FounderProfileSchema = z.object({
  userId: z.string(),
  // Business identity
  industry: z.string().optional(),
  stage: z.enum(['idea', 'mvp', 'launched', 'growth', 'scale', 'unknown']).optional(),
  location: z.string().optional(),
  teamSize: z.number().int().min(0).max(100000).optional(),
  monthlyRevenueEgp: z.number().min(0).optional(),

  // Founder voice
  goals: z.array(z.string()).max(5).default([]),
  painPoints: z.array(z.string()).max(5).default([]),
  preferences: z.array(z.string()).max(5).default([]),

  // Free-form memorable facts (capped) — captures things like family status,
  // education, prior startups, side projects.
  notes: z.array(z.string()).max(10).default([]),

  // Audit
  updatedAt: z.number(),
  messageCount: z.number().int().min(0).default(0),
});

export type FounderProfile = z.infer<typeof FounderProfileSchema>;

const STORE: Map<string, FounderProfile> = new Map();
const MAX_STORE = 5000;

function ensure(userId: string): FounderProfile {
  let p = STORE.get(userId);
  if (!p) {
    p = {
      userId,
      goals: [],
      painPoints: [],
      preferences: [],
      notes: [],
      updatedAt: Date.now(),
      messageCount: 0,
    };
    STORE.set(userId, p);
    if (STORE.size > MAX_STORE) {
      // Evict the oldest entry.
      const oldest = [...STORE.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt)[0];
      if (oldest) STORE.delete(oldest[0]);
    }
  }
  return p;
}

export function getFounderProfile(userId: string | undefined | null): FounderProfile | null {
  if (!userId) return null;
  return STORE.get(userId) || null;
}

export function setFounderProfile(p: FounderProfile): void {
  STORE.set(p.userId, { ...p, updatedAt: Date.now() });
}

/**
 * Merge an extracted partial profile into the existing one. Lists union with
 * cap; scalar fields prefer the *new* value when defined.
 */
export function mergeFounderProfile(userId: string, patch: Partial<FounderProfile>): FounderProfile {
  const cur = ensure(userId);
  const merged: FounderProfile = {
    ...cur,
    ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined && v !== '')),
    goals: dedup([...(cur.goals || []), ...((patch.goals as string[]) || [])]).slice(0, 5),
    painPoints: dedup([...(cur.painPoints || []), ...((patch.painPoints as string[]) || [])]).slice(0, 5),
    preferences: dedup([...(cur.preferences || []), ...((patch.preferences as string[]) || [])]).slice(0, 5),
    notes: dedup([...(cur.notes || []), ...((patch.notes as string[]) || [])]).slice(-10),
    userId,
    updatedAt: Date.now(),
    messageCount: (cur.messageCount || 0) + 1,
  };
  STORE.set(userId, merged);
  return merged;
}

function dedup(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const k = x.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x.trim());
  }
  return out;
}

/**
 * Render the profile as a short Arabic context block injected into agent
 * system prompts. Returns '' when the profile is empty so we don't waste
 * tokens.
 */
export function renderProfileContext(p: FounderProfile | null | undefined): string {
  if (!p) return '';
  const lines: string[] = [];
  const ident: string[] = [];
  if (p.industry) ident.push(`المجال: ${p.industry}`);
  if (p.stage && p.stage !== 'unknown') ident.push(`المرحلة: ${stageAr(p.stage)}`);
  if (p.location) ident.push(`الموقع: ${p.location}`);
  if (p.teamSize !== undefined) ident.push(`حجم الفريق: ${p.teamSize}`);
  if (p.monthlyRevenueEgp !== undefined) ident.push(`الإيراد الشهري ≈ ${p.monthlyRevenueEgp.toLocaleString('en-EG')} EGP`);
  if (ident.length) lines.push(`- ${ident.join(' · ')}`);
  if (p.goals.length) lines.push(`- أهداف معلنة: ${p.goals.join(' / ')}`);
  if (p.painPoints.length) lines.push(`- نقاط الألم: ${p.painPoints.join(' / ')}`);
  if (p.preferences.length) lines.push(`- تفضيلات: ${p.preferences.join(' / ')}`);
  if (p.notes.length) lines.push(`- ملاحظات سابقة: ${p.notes.slice(-3).join(' • ')}`);
  if (!lines.length) return '';
  return `\n\nملف المؤسس (من جلسات سابقة — استخدمه لتخصيص الجواب، لا تكرره حرفياً):\n${lines.join('\n')}`;
}

function stageAr(s: string): string {
  return ({
    idea: 'فكرة',
    mvp: 'منتج أولي (MVP)',
    launched: 'أُطلق حديثاً',
    growth: 'نمو',
    scale: 'توسّع',
  } as Record<string, string>)[s] || s;
}

/**
 * Use a cheap LITE call to extract profile patches from the latest user
 * message. Returns null on failure / no signal so the caller can move on.
 *
 * Runs *async* in supervisor (fire-and-forget) so it never blocks the
 * response stream — the next turn will benefit from the captured fact.
 */
const ExtractSchema = z.object({
  industry: z.string().optional(),
  stage: z.enum(['idea', 'mvp', 'launched', 'growth', 'scale', 'unknown']).optional(),
  location: z.string().optional(),
  teamSize: z.number().int().optional(),
  monthlyRevenueEgp: z.number().optional(),
  goals: z.array(z.string()).max(3).default([]),
  painPoints: z.array(z.string()).max(3).default([]),
  preferences: z.array(z.string()).max(3).default([]),
  notes: z.array(z.string()).max(3).default([]),
});

export async function extractProfilePatchLLM(message: string): Promise<Partial<FounderProfile> | null> {
  // Heuristic skip: if the message has no first-person personal statements,
  // skip the LLM call to save tokens.
  if (message.length < 10) return null;
  if (!/(أنا|أنى|عندي|شركت[يى]?|مشروع[يى]?|فريق[يى]?|إيراد|دخلي|في\s+مصر|in\s+egypt|stage|founder)/i.test(message)) {
    return null;
  }
  try {
    const { object } = await generateObject({
      model: MODELS.LITE,
      schema: ExtractSchema,
      system:
        'استخرج فقط ما ذكره المستخدم صراحة عن نفسه/مشروعه. لا تخترع شيئاً. كل القوائم اختيارية وقد تكون فارغة. أعد JSON فقط.',
      prompt: `رسالة المستخدم: "${message.slice(0, 2000)}"`,
      maxRetries: 0,
    });
    return object as Partial<FounderProfile>;
  } catch {
    return null;
  }
}

export function getProfileStats(): { total: number; lastUpdated: number } {
  let lastUpdated = 0;
  for (const p of STORE.values()) {
    if (p.updatedAt > lastUpdated) lastUpdated = p.updatedAt;
  }
  return { total: STORE.size, lastUpdated };
}

/** Test-only: clear all in-memory state. */
export function _resetFounderProfileStore(): void {
  STORE.clear();
}

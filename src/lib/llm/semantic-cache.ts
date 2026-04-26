/**
 * Semantic Prompt Cache — Kalmeron Two
 * --------------------------------------------------------------
 * طبقة دلالية فوق `prompt-cache.ts`. الفرق الجوهري:
 *
 *   - الكاش الأساسي (`prompt-cache.ts`) يطابق بالـ SHA-256 الحرفي
 *     للموجِّه — أي تعديل بحرف واحد يفوّت الكاش.
 *
 *   - هذه الطبقة تستخدم تضمينات (embeddings) من
 *     `gemini-embedding-001` للعثور على موجِّهات دلالياً متقاربة
 *     عبر تشابه جيب التمام (cosine similarity) ≥ عتبة قابلة للتهيئة.
 *
 *   - مفيدة جداً للأسئلة شائعة الصياغة:
 *       "ما هو كلميرون؟"  ≈  "كلميرون ايه؟"  ≈  "what is kalmeron?"
 *     جميعها تشترك في إجابة مخزَّنة واحدة.
 *
 * البنية:
 *   L1 سريع: خريطة في الذاكرة `vector → entry` بحدّ أقصى 200 إدخالاً.
 *   L2 دائم: مجموعة Firestore `semantic_prompt_cache` (TTL = 7 أيام)
 *          يُجلب منها بحد أقصى 64 إدخالاً للوكيل في كل startup
 *          (عيّنة ساخنة) لتفادي تكلفة استعلام Firestore الكامل لكل طلب.
 *
 * أمان: لا تُخزَّن مدخلات تحتوي PII (مفحوصة بالـ redactor قبل الاستدعاء).
 * تكلفة: تضمين واحد لكل query، رخيص جداً (~0.00002$ على Gemini-001).
 */
import { createHash } from 'node:crypto';

import type { CachedResponse } from './prompt-cache';

// ─────────────────────────────────────────────────────────────
// أنواع البيانات
// ─────────────────────────────────────────────────────────────

export interface SemanticCacheKeyParts {
  /** اسم الوكيل لعزل الكاش (e.g. "ChiefOfStaff", "FAQ", "Receptionist"). */
  scope: string;
  /** المزوّد (google, openai, …). */
  provider: string;
  /** نموذج LLM المستخدم. */
  model: string;
  /** درجة النموذج (lite/flash/pro). */
  tier: string;
  /** نص الموجِّه — يُضمَّن دلالياً. */
  prompt: string;
}

interface SemanticEntry {
  scope: string;
  provider: string;
  model: string;
  tier: string;
  /** مُتجه التضمين (1024–3072 بُعد حسب النموذج). */
  vector: number[];
  /** هاش الموجِّه الأصلي — لتفادي تكرار حرفي. */
  promptHash: string;
  /** الاستجابة المخزَّنة. */
  response: CachedResponse;
  /** عدد الإصابات — للترقية إلى L1. */
  hits: number;
}

export interface SemanticHit {
  response: CachedResponse;
  similarity: number;
  scope: string;
}

// ─────────────────────────────────────────────────────────────
// L1 — في الذاكرة
// ─────────────────────────────────────────────────────────────

const L1_MAX_ENTRIES = 200;
const L1_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const DEFAULT_THRESHOLD = 0.92;       // تشابه جيب التمام (0..1)

interface L1Slot {
  entry: SemanticEntry;
  expiresAt: number;
}

const l1: Map<string, L1Slot> = new Map();

function l1Key(scope: string, hash: string): string {
  return `${scope}::${hash}`;
}

function purgeExpired(): void {
  const now = Date.now();
  for (const [k, v] of l1) {
    if (v.expiresAt < now) l1.delete(k);
  }
}

function evictLRU(): void {
  if (l1.size < L1_MAX_ENTRIES) return;
  // الأقدم في خريطة JavaScript هو أول مفتاح في التكرار.
  const oldest = l1.keys().next().value;
  if (oldest) l1.delete(oldest);
}

// ─────────────────────────────────────────────────────────────
// رياضيات التشابه
// ─────────────────────────────────────────────────────────────

/** يحسب جيب التمام بين متجهين بنفس البُعد. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** هاش لمفتاح L2 (موجِّه + مزوّد + نموذج). */
function promptHashFor(parts: SemanticCacheKeyParts): string {
  const norm = parts.prompt.trim().toLowerCase().replace(/\s+/g, ' ');
  const raw = `${parts.scope}|${parts.provider}|${parts.model}|${parts.tier}|${norm}`;
  return createHash('sha256').update(raw).digest('hex');
}

// ─────────────────────────────────────────────────────────────
// L2 — Firestore (تحميل كسول + كتابة fire-and-forget)
// ─────────────────────────────────────────────────────────────

const L2_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** يحدّ مدة جلب L2 لتفادي تجميد المسار الساخن لو فشل Firestore. */
const L2_FETCH_TIMEOUT_MS = 1500;

async function l2Read(scope: string): Promise<SemanticEntry[]> {
  // في بيئة الاختبار/CI لا نلمس Firestore أبداً.
  if (process.env.NODE_ENV === 'test' || process.env.SEMANTIC_CACHE_DISABLE_L2 === '1') {
    return [];
  }
  const work = (async () => {
    const { adminDb } = await import('@/src/lib/firebase-admin');
    const snap = await adminDb
      .collection('semantic_prompt_cache')
      .where('scope', '==', scope)
      .orderBy('hits', 'desc')
      .limit(64)
      .get();
    const out: SemanticEntry[] = [];
    const now = Date.now();
    snap.forEach((doc) => {
      const d = doc.data() as SemanticEntry & { storedAt?: number };
      if (d.response && (now - (d.response.storedAt ?? now)) < L2_TTL_MS) {
        out.push(d);
      }
    });
    return out;
  })();

  const timeout = new Promise<SemanticEntry[]>((resolve) =>
    setTimeout(() => resolve([]), L2_FETCH_TIMEOUT_MS),
  );

  try {
    return await Promise.race([work, timeout]);
  } catch {
    return [];
  }
}

function l2Write(entry: SemanticEntry): void {
  void (async () => {
    try {
      const { adminDb } = await import('@/src/lib/firebase-admin');
      await adminDb
        .collection('semantic_prompt_cache')
        .doc(entry.promptHash)
        .set(entry, { merge: true });
    } catch {
      /* swallow — best-effort */
    }
  })();
}

// ─────────────────────────────────────────────────────────────
// تضمينات
// ─────────────────────────────────────────────────────────────

type EmbedFn = (text: string) => Promise<number[]>;

/** يُحقن وقت التشغيل من `getCachedEmbedding`. لو لم يُحقن نُرجع `null`. */
let embedFn: EmbedFn | null = null;
export function setSemanticEmbedder(fn: EmbedFn): void {
  embedFn = fn;
}

async function embed(text: string): Promise<number[] | null> {
  if (!embedFn) return null;
  try {
    const v = await embedFn(text);
    return Array.isArray(v) && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// تحميل أوّلي (سحب أعلى 64 إصابة من L2 إلى L1 لكل scope عند أول طلب)
// ─────────────────────────────────────────────────────────────

const warmedScopes: Set<string> = new Set();

async function warmScope(scope: string): Promise<void> {
  if (warmedScopes.has(scope)) return;
  warmedScopes.add(scope);
  const entries = await l2Read(scope);
  for (const e of entries) {
    purgeExpired();
    evictLRU();
    l1.set(l1Key(scope, e.promptHash), {
      entry: e,
      expiresAt: Date.now() + L1_TTL_MS,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// واجهة عامة
// ─────────────────────────────────────────────────────────────

/**
 * يبحث عن أقرب موجِّه دلالياً في L1+L2.
 * @returns إصابة إذا تجاوز التشابه العتبة، وإلا `null`.
 */
export async function getSemanticCached(
  parts: SemanticCacheKeyParts,
  threshold: number = DEFAULT_THRESHOLD,
): Promise<SemanticHit | null> {
  await warmScope(parts.scope);

  const queryVec = await embed(parts.prompt);
  if (!queryVec) return null;

  let best: { sim: number; entry: SemanticEntry } | null = null;
  purgeExpired();
  for (const slot of l1.values()) {
    const e = slot.entry;
    if (e.scope !== parts.scope) continue;
    if (e.provider !== parts.provider || e.model !== parts.model || e.tier !== parts.tier) continue;
    const sim = cosineSimilarity(queryVec, e.vector);
    if (!best || sim > best.sim) best = { sim, entry: e };
  }

  if (best && best.sim >= threshold) {
    best.entry.hits += 1;
    return { response: best.entry.response, similarity: best.sim, scope: parts.scope };
  }
  return null;
}

/**
 * يخزّن موجِّهاً جديداً + استجابته. التضمين يحدث مرة واحدة.
 */
export async function setSemanticCached(
  parts: SemanticCacheKeyParts,
  response: Omit<CachedResponse, 'storedAt'>,
): Promise<void> {
  const vector = await embed(parts.prompt);
  if (!vector) return;

  const entry: SemanticEntry = {
    scope: parts.scope,
    provider: parts.provider,
    model: parts.model,
    tier: parts.tier,
    vector,
    promptHash: promptHashFor(parts),
    response: { ...response, storedAt: Date.now() },
    hits: 1,
  };

  purgeExpired();
  evictLRU();
  l1.set(l1Key(parts.scope, entry.promptHash), {
    entry,
    expiresAt: Date.now() + L1_TTL_MS,
  });
  l2Write(entry);
}

/** إحصاءات للوحة التكاليف. */
export function getSemanticCacheStats(): {
  l1Size: number;
  l1Max: number;
  warmedScopes: number;
  defaultThreshold: number;
} {
  return {
    l1Size: l1.size,
    l1Max: L1_MAX_ENTRIES,
    warmedScopes: warmedScopes.size,
    defaultThreshold: DEFAULT_THRESHOLD,
  };
}

/** اختبارات/أدمن — يصفّر الذاكرة. */
export function _clearSemanticL1(): void {
  l1.clear();
  warmedScopes.clear();
}

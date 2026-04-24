/**
 * PII Redactor — Arabic-aware
 * ----------------------------
 * Detects and redacts personally-identifiable information from free-text
 * inputs *before* they are sent to LLM providers. Tuned for the MENA
 * audience: Egyptian phone numbers (01x), national IDs (14 digits encoding
 * birthdate + governorate), Saudi IDs (10 digits starting 1/2), IBANs,
 * email, credit cards, and addresses written in Arabic ("شارع …").
 *
 * Returns a redacted string + a typed audit trail (no raw values stored).
 *
 * Used by:
 *   - chat / agent ingress (POST /api/chat, /api/agents/*)
 *   - document upload pipeline (when shipped)
 *   - admin LLM-audit logger
 */

export type PiiKind =
  | "egypt_phone"
  | "saudi_phone"
  | "intl_phone"
  | "egypt_national_id"
  | "saudi_national_id"
  | "iban"
  | "credit_card"
  | "email"
  | "address_ar"
  | "ipv4";

export interface PiiHit {
  kind: PiiKind;
  /** Length of the matched string (no raw value stored). */
  length: number;
  /** 0-based index in the original string. */
  index: number;
}

export interface RedactionResult {
  /** Cleaned text safe to forward to an LLM. */
  redacted: string;
  /** Audit trail (never contains raw values). */
  hits: PiiHit[];
}

interface Pattern {
  kind: PiiKind;
  re: RegExp;
  /** Replacement label, e.g. `[رقم هاتف]`. */
  label: string;
}

/**
 * Patterns are evaluated top-to-bottom; longer/more-specific first to avoid
 * a credit card being partially matched as a phone number.
 */
const PATTERNS: Pattern[] = [
  // ── Credit cards (13-19 digits, optional dashes/spaces) ──
  {
    kind: "credit_card",
    re: /\b(?:\d[ -]?){13,19}\b/g,
    label: "[بطاقة]",
  },

  // ── IBAN (country code + 2-30 alphanumerics, with possible spaces) ──
  {
    kind: "iban",
    re: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b/g,
    label: "[IBAN]",
  },

  // ── Egyptian national ID (14 digits) ──
  {
    kind: "egypt_national_id",
    re: /\b[23]\d{13}\b/g,
    label: "[رقم قومي]",
  },

  // ── Saudi national ID (10 digits starting 1 or 2) ──
  {
    kind: "saudi_national_id",
    re: /\b[12]\d{9}\b/g,
    label: "[هوية وطنية]",
  },

  // ── International phone (E.164: +<1-3 cc><7-12 digits>) ──
  {
    kind: "intl_phone",
    re: /\+\d{1,3}[ -]?\d{6,12}\b/g,
    label: "[هاتف]",
  },

  // ── Egyptian mobile (01[0-25] + 8 digits) ──
  {
    kind: "egypt_phone",
    re: /\b01[0-25]\d{8}\b/g,
    label: "[هاتف]",
  },

  // ── Saudi mobile (05 + 8 digits, or 5 + 8 digits) ──
  {
    kind: "saudi_phone",
    re: /\b05\d{8}\b/g,
    label: "[هاتف]",
  },

  // ── Email ──
  {
    kind: "email",
    re: /[\p{L}\d._%+-]+@[\p{L}\d.-]+\.[A-Za-z]{2,}/gu,
    label: "[بريد]",
  },

  // ── Arabic address heuristic: "شارع …" or "ش. …" + 2-5 words/numbers ──
  {
    kind: "address_ar",
    re: /(?:\b(?:شارع|ش\.?)\s+[\u0600-\u06FF\d ]{4,80})/g,
    label: "[عنوان]",
  },

  // ── IPv4 ──
  {
    kind: "ipv4",
    re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    label: "[IP]",
  },
];

/**
 * Redacts PII from `input`. Replacements collapse to the configured label.
 * The audit trail keeps only the type, original length, and offset.
 *
 * @example
 *   redactPii("اتصلي على 01012345678 أو ahmed@x.com")
 *   // -> { redacted: "اتصلي على [هاتف] أو [بريد]",
 *   //      hits: [{kind:"egypt_phone",...}, {kind:"email",...}] }
 */
export function redactPii(input: string): RedactionResult {
  if (!input) return { redacted: input, hits: [] };

  const hits: PiiHit[] = [];
  let out = input;

  // Track replacements so subsequent regex run against the *progressively*
  // redacted string (avoids overlapping matches like phone-inside-card).
  for (const p of PATTERNS) {
    out = out.replace(p.re, (match, offset: number) => {
      hits.push({ kind: p.kind, length: match.length, index: offset });
      return p.label;
    });
  }

  return { redacted: out, hits };
}

/** Quick boolean check — useful for guard-clauses without paying the rewrite cost. */
export function containsPii(input: string): boolean {
  if (!input) return false;
  for (const p of PATTERNS) {
    if (p.re.test(input)) {
      // Reset regex.lastIndex for stateful /g regexes
      p.re.lastIndex = 0;
      return true;
    }
    p.re.lastIndex = 0;
  }
  return false;
}

/** Aggregate counts by PII type — used in audit dashboards. */
export function summarizeHits(hits: PiiHit[]): Record<PiiKind, number> {
  const out = {} as Record<PiiKind, number>;
  for (const h of hits) out[h.kind] = (out[h.kind] ?? 0) + 1;
  return out;
}

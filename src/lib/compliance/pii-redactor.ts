/**
 * PII Redactor — تنقية المدخلات والمخرجات من البيانات الحساسة
 * يدعم: الرقم القومي المصري (14 رقم)، أرقام الهواتف المصرية، البريد الإلكتروني،
 * بطاقات الائتمان (Luhn-friendly heuristic)، وأرقام IBAN.
 *
 * يُستخدم في طبقة llm/gateway قبل إرسال أي شيء إلى النموذج وبعد استلام الرد،
 * كما يمكن استدعاؤه يدوياً عند تخزين النصوص في audit logs.
 */

export interface RedactionResult {
  redacted: string;
  hits: Array<{ type: string; count: number }>;
}

const PATTERNS: Array<{ type: string; regex: RegExp; replace: string }> = [
  // الرقم القومي المصري: 14 رقم متتالي
  { type: 'egypt_national_id', regex: /\b[2-3]\d{13}\b/g, replace: '[NATIONAL_ID_REDACTED]' },
  // أرقام الهواتف المصرية: +20 أو 0 ثم 1 ثم 9 أرقام
  { type: 'egypt_phone', regex: /(?:\+?20|0)?1[0-9]{9}\b/g, replace: '[PHONE_REDACTED]' },
  // البريد الإلكتروني
  { type: 'email', regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, replace: '[EMAIL_REDACTED]' },
  // بطاقات ائتمان: 13–19 رقم مع/بدون فواصل
  { type: 'credit_card', regex: /\b(?:\d[ -]*?){13,19}\b/g, replace: '[CARD_REDACTED]' },
  // IBAN مصري: EG ثم 27 رقم
  { type: 'egypt_iban', regex: /\bEG\d{27}\b/gi, replace: '[IBAN_REDACTED]' },
];

export function redactPII(input: string): RedactionResult {
  if (!input) return { redacted: input, hits: [] };
  let redacted = input;
  const hits: Array<{ type: string; count: number }> = [];

  for (const { type, regex, replace } of PATTERNS) {
    const matches = redacted.match(regex);
    if (matches && matches.length > 0) {
      hits.push({ type, count: matches.length });
      redacted = redacted.replace(regex, replace);
    }
  }

  return { redacted, hits };
}

/** نسخة سريعة بدون إحصائيات */
export function redact(input: string): string {
  return redactPII(input).redacted;
}

/** فحص هل النص يحتوي على PII دون تعديله */
export function containsPII(input: string): boolean {
  if (!input) return false;
  // ننسخ كل regex بدون علم `g` لتجنّب drift في `lastIndex` بين الاستدعاءات.
  return PATTERNS.some(({ regex }) => {
    const stateless = new RegExp(regex.source, regex.flags.replace('g', ''));
    return stateless.test(input);
  });
}

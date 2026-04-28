/**
 * PII Redactor — تنقية المدخلات والمخرجات من البيانات الحساسة
 *
 * يدعم:
 *  - الرقم القومي المصري (14 رقم) والسعودي (10 أرقام تبدأ بـ 1 أو 2)
 *  - أرقام الهواتف المصرية (010/011/012/015) والسعودية (5x) والدولية
 *  - البريد الإلكتروني
 *  - بطاقات الائتمان (13–19 رقم)
 *  - أرقام IBAN المصرية (EG…) والعامة (أي بادئة دولتين)
 *  - العناوين العربية (رقم + "شارع/ميدان/كورنيش" + اسم + اختياري رمز بريدي)
 *
 * ترتيب الأنماط مهم: الأكثر تحديداً أولاً لمنع التداخل (مثلاً البريد قبل
 * IBAN العام، والرقم القومي قبل بطاقات الائتمان).
 *
 * يُستخدم في طبقة llm/gateway قبل إرسال أي شيء إلى النموذج وبعد استلام الرد،
 * كما يمكن استدعاؤه يدوياً عند تخزين النصوص في audit logs.
 */

export interface RedactionResult {
  redacted: string;
  hits: Array<{ type: string; count: number }>;
}

const PATTERNS: Array<{ type: string; regex: RegExp; replace: string }> = [
  // البريد الإلكتروني — أكثر الأنماط تحديداً.
  { type: 'email', regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, replace: '[EMAIL_REDACTED]' },

  // IBAN مصري (EG + 27 رقم) — قبل النمط العام لاستخراج النوع الدقيق.
  { type: 'egypt_iban', regex: /\bEG\d{27}\b/gi, replace: '[IBAN_REDACTED]' },

  // IBAN عام (دولتان + رقمان + 11–30 حرف/رقم). يستخدم بعد egypt_iban
  // لذا الـEG قد رُدِكت بالفعل ولا تتداخل النتيجة.
  {
    type: 'iban',
    regex: /\b(?!EG)[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    replace: '[IBAN_REDACTED]',
  },

  // الرقم القومي المصري: 14 رقم يبدأ بـ 2 أو 3 (قرن 19/20).
  // قبل بطاقات الائتمان لمنع تداخل الـ Luhn.
  { type: 'egypt_national_id', regex: /\b[2-3]\d{13}\b/g, replace: '[NATIONAL_ID_REDACTED]' },

  // بطاقات ائتمان: 13–19 رقم متتالٍ (مع/بدون فواصل).
  { type: 'credit_card', regex: /\b(?:\d[ -]*?){13,19}\b/g, replace: '[CARD_REDACTED]' },

  // الرقم القومي السعودي: 10 أرقام تبدأ بـ 1 (مواطن) أو 2 (مقيم).
  // قبل أرقام الهاتف المصرية لتفادي اعتباره موبايل مصري.
  { type: 'saudi_national_id', regex: /\b[12]\d{9}\b/g, replace: '[NATIONAL_ID_REDACTED]' },

  // أرقام الهواتف المصرية: تبدأ بـ +20 أو 0020 أو 0 ثم 1 ثم رمز شبكة
  // صالح (0/1/2/5) ثم 8 أرقام. الـ 1[0125] حرج لأنه يمنع التطابق مع
  // الهوية السعودية (1023456789) التي ليس رمزها 10/11/12/15.
  {
    type: 'egypt_phone',
    regex: /(?:\+?20|0020|0)?1[0125]\d{8}\b/g,
    replace: '[PHONE_REDACTED]',
  },

  // الهاتف السعودي: +966 أو 0 ثم 5 ثم 8 أرقام (موبايل STC/Mobily/Zain).
  {
    type: 'saudi_phone',
    regex: /(?:\+?966|0)5\d{8}\b/g,
    replace: '[PHONE_REDACTED]',
  },

  // أي رقم دولي آخر بصيغة E.164 (يبدأ بـ + وبادئة دولة 1–3 رقم ثم 6–12 رقم).
  // يُنفَّذ بعد المصري والسعودي لتفادي ازدواجية التصنيف.
  {
    type: 'intl_phone',
    regex: /\+\d{1,3}[\s-]?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
    replace: '[PHONE_REDACTED]',
  },

  // العناوين العربية الشائعة: رقم اختياري + "شارع/ميدان/كورنيش/طريق/حي"
  // + اسم عربي + (اختياري) أحياء/مدن/رمز بريدي 4–5 أرقام.
  // مفيد لاستخراج عناوين مثل: "12 شارع الخليفة المأمون، الزمالك، القاهرة 11211".
  {
    type: 'address',
    regex:
      /(?:\d{1,4}\s+)?(?:شارع|ميدان|كورنيش|طريق|حي|منطقة)\s+[\u0600-\u06FF][\u0600-\u06FF\s]+(?:[،,]\s*[\u0600-\u06FF][\u0600-\u06FF\s]+){0,3}(?:\s+\d{4,5})?/g,
    replace: '[ADDRESS_REDACTED]',
  },
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

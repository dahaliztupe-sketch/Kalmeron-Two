/**
 * Prompt Guard — Kalmeron Two
 * --------------------------------------------------------------
 * طبقات دفاع متراكمة ضد حقن الموجِّهات (Prompt Injection / Jailbreak)
 * مستلهمة من OWASP LLM01:2025 و NIST AI 600-1:
 *
 *   1) `sanitizeInput`        — يزيل علامات تعليمات النظام المخفية.
 *   2) `isolateUserInput`     — يلفّ مدخلات المستخدم في وسوم XML واضحة.
 *   3) `validatePromptIntegrity` — يكتشف محاولات تجاوز التعليمات
 *      بالإنجليزية والعربية وعدّة لغات أخرى عبر مصفوفة أنماط واسعة.
 *   4) `scorePromptRisk`      — يعطي نتيجة 0..1 (مفيد للقياس والتحليل
 *      دون رفض الطلب فوراً).
 *
 * كل دالة *نقية* (pure function) — لا تعتمد على I/O — لذا تختبَر بسهولة
 * وتعمل في حافة Edge runtime.
 */

// ============================================================
// 1) تطهير دلالي
// ============================================================

/**
 * يزيل بادئات/لاحقات شائعة تُستخدم لحقن تعليمات نظام مزيّفة:
 *   `[SYSTEM]`, `[INST]`, `<<HIDDEN>>`, `[AGENT]`, `[TOOL]`, `<|im_start|>system`,
 *   `### Instruction:`, `</SYS>`, إلخ.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  let out = input;

  // وسوم تعليمات شائعة
  out = out.replace(/\[(?:SYSTEM|INST|AGENT|TOOL|ASSISTANT)\]/gi, '');
  out = out.replace(/\[\/(?:SYSTEM|INST|AGENT|TOOL|ASSISTANT)\]/gi, '');
  out = out.replace(/<<\/?(?:HIDDEN|SYS|INST|SYSTEM)>>/gi, '');

  // بادئات قوالب نماذج (chat-templates) شائعة
  out = out.replace(/<\|im_start\|>\s*\w+/gi, '');
  out = out.replace(/<\|im_end\|>/gi, '');
  out = out.replace(/<\|system\|>|<\|user\|>|<\|assistant\|>/gi, '');
  out = out.replace(/###\s*(?:Instruction|System|Response):/gi, '');
  out = out.replace(/<\/?\s*system\s*>/gi, '');

  // محاولات Markdown لإخفاء توجيهات داخل تعليقات HTML
  // -----------------------------------------------------------
  // نقوم بحذف تعليقات `<!-- ... -->` بشكل آمن. نَستخدم حلقة
  // ثابتة (fixed-point loop) حتى لا يتمكّن مهاجم من تجاوز التطهير
  // بحقن تعليقات متشعّبة أو مفصولة، مثل:
  //
  //     "<!--<!-- evil -->-->"
  //
  // الـ regex غير-الجشع يستهلك التعليق الأعمق ويترك "-->" خلفه؛
  // التكرار يُزيلها إلى أن تصبح السلسلة مستقرّة. كما أنّنا نُزيل
  // أيضًا أيّ بقايا فواصل تعليقات شبه-مفتوحة (مثل `<!--` بدون
  // إغلاق) لمنع تحوّل الإخراج إلى تعليق صالح في سياق HTML لاحق.
  // يعالج هذا التحذير CodeQL: js/incomplete-multi-character-sanitization.
  let prev: string;
  do {
    prev = out;
    out = out.replace(/<!--[\s\S]*?-->/g, '');
  } while (out !== prev);
  // أزل الفواصل المتبقّية حتى لا يُعاد تكوين تعليق بعد الدمج لاحقاً.
  out = out.replace(/<!--/g, '').replace(/-->/g, '');

  return out;
}

// ============================================================
// 2) عزل مدخلات المستخدم
// ============================================================

/**
 * يلفّ المدخل في وسوم XML واضحة لكي يستطيع النموذج التمييز بين تعليمات
 * النظام ومحتوى المستخدم. يدعم namespacing لتمييز مصدر المحتوى
 * (مثلاً `pdf` أو `web` أو `email`).
 *
 * يستخدم تطهيراً كاملاً للأحرف الخاصة بـ XML بدلاً من regex غير مكتمل
 * (يعالج تحذيرَي CodeQL: js/bad-tag-filter و js/incomplete-multi-character-sanitization).
 */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isolateUserInput(input: string, source = 'user'): string {
  const tag = source.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'user';
  return `<${tag}_input>\n${escapeXml(input)}\n</${tag}_input>`;
}

// ============================================================
// 3) كشف محاولات تجاوز التعليمات
// ============================================================

/**
 * مصفوفة أنماط جوهرية لمحاولات الحقن.
 * كل نمط مرفق بدرجة (0..1) — مجموع الدرجات يحدد قرار الرفض.
 *
 * ملاحظة: الأنماط مكتوبة لتقاوم المسافات الزائدة، تشكيل الأحرف العربية،
 * والاستبدالات leet-speak الشائعة (مثل `1gn0re` بدل `ignore`).
 */
interface InjectionPattern {
  /** اسم النمط (للتسجيل/التشخيص). */
  name: string;
  /** RegExp الفعلي. */
  regex: RegExp;
  /** ثقل الخطر (0..1). */
  weight: number;
}

const INJECTION_PATTERNS: readonly InjectionPattern[] = [
  // --- إنجليزي: تجاوز تعليمات صريح ---
  // يطابق: "ignore [all|any|the|previous|prior|earlier|your|original|safety|above]* instructions/prompts/rules/etc"
  { name: 'en_ignore_instructions',
    // Note: the {0,40} window between verb and noun must use a non-capturing
    // alternation `(?:…)` for the optional qualifiers — earlier revisions used
    // a character class `[all|any|the|…]` by mistake (CodeQL js/regex/duplicates).
    regex: /\b(?:ignore|disregard|forget|override|bypass|skip|cancel|abandon|remove|delete)\b(?:\s+(?:all|any|the|previous|prior|earlier|your|original|safety|above))*[\s\w]{0,40}?\b(?:instructions?|prompts?|rules?|directives?|guidelines?|orders?|guardrails?|restrictions?|safeguards?|policies)\b/i,
    weight: 0.9 },
  // "from now on, respond freely / answer freely / talk freely" pattern
  { name: 'en_respond_freely',
    regex: /\b(?:respond|answer|reply|talk|speak|act)\s+(?:freely|without\s+(?:any\s+)?(?:filter|restriction|safety|guardrail|censorship|limit))/i,
    weight: 0.85 },
  // role-flip — نُحصر "act as" بأهداف خطرة (terminal/shell/admin/...) لتفادي
  // الإيجابيات الزائفة في "I want to act as a CFO".
  { name: 'en_new_role',
    regex: /\b(?:you\s+(?:are\s+(?:now|going\s+to\s+be)|will\s+now\s+be|must\s+now\s+be)|your\s+new\s+role\s+is|pretend\s+(?:to\s+be|that\s+you)|roleplay\s+as|simulate\s+being|play\s+the\s+role\s+of)\b/i,
    weight: 0.85 },
  { name: 'en_act_as_dangerous',
    regex: /\b(?:act\s+as|behave\s+as|respond\s+as|reply\s+as)\s+(?:a\s+|an\s+|the\s+)?(?:linux|unix|bash|sh|terminal|shell|root|admin(?:istrator)?|hacker|cracker|jailbroken|unrestricted|uncensored|unfiltered|evil|malicious|amoral|dan|dude|stan)\b/i,
    weight: 0.95 },
  { name: 'en_reveal_system',
    regex: /\b(?:reveal|show|print|display|repeat|reproduce|leak|expose|tell\s+me|give\s+me|share|output)\b[\s\w]{0,40}?\b(?:system\s+)?(?:prompts?|instructions?|rules?|directives?|guidelines?|configurations?)\b/i,
    weight: 0.85 },
  { name: 'en_dan_jailbreak',
    regex: /\b(?:DAN|DUDE|STAN|do\s+anything\s+now|developer\s+mode|dev\s+mode|jailbreak|unlocked?\s+mode|god\s+mode|admin\s+mode|root\s+access)\b/i,
    weight: 0.95 },
  { name: 'en_no_filter',
    regex: /\b(?:without\s+(?:any\s+)?(?:filter|filters|restriction|restrictions|censorship|safety|guardrails?|limits?|moral|ethic)|no\s+(?:filter|restriction|safety|guardrail|limits?|censorship|moral|ethic))/i,
    weight: 0.9 },
  { name: 'en_stop_being',
    regex: /\b(?:stop\s+being|you\s+(?:no\s+longer|are\s+not|are\s+no\s+longer))\b[\s\w]{0,30}?\b(?:assistant|ai|model|chatbot|helpful)/i,
    weight: 0.9 },
  { name: 'en_unrestricted',
    regex: /\b(?:unrestricted|uncensored|unfiltered|unethical|amoral)\s+(?:ai|assistant|model|chatbot|bot|version|mode)/i,
    weight: 0.9 },

  // --- إنجليزي: تسريب أو استخراج ---
  { name: 'en_print_history',
    regex: /\b(?:print|dump|output|reveal|show)\b[\s\w]{0,20}?\b(?:conversation|history|memory|context|tokens?|chat\s+log)/i,
    weight: 0.7 },
  { name: 'en_base64_decode',
    regex: /\b(?:base64|rot13|hex|atob)\s*(?:decode|encoded|encode)/i,
    weight: 0.5 },

  // --- إنجليزي: حقن غير مباشر (شائع في PDF/web/email) ---
  { name: 'en_assistant_says',
    regex: /\b(?:assistant|ai|model|system)\s*(?::|says?|reply|responded?)\s*["']?(?:sure|certainly|of\s+course|here\s+is|here[']?s|i\s+(?:will|can|shall))/i,
    weight: 0.7 },
  { name: 'en_user_intent_flip',
    regex: /\b(?:the\s+user\s+(?:actually|really|secretly)\s+wants?|the\s+real\s+(?:question|task|goal|intent)\s+is|user(?:['\u2019])?s\s+true\s+(?:goal|intent))/i,
    weight: 0.85 },

  // --- عربي: تجاوز تعليمات صريح ---
  // إصلاح المسافات: نسمح بكلمات تصل لـ 40 محرف بين الفعل والمفعول.
  // ملاحظة: Arabic لا يعرف \b، لذلك نضيف negative-lookbehind للأحرف العربية
  // حول الأفعال القصيرة (تخطّ/تخط/الغ/كن/...) لتفادي الإيجابيات الزائفة
  // داخل كلمات شائعة مثل: تخطيط، الغير، ممكن، يمكن، لكن، يكن.
  { name: 'ar_ignore',
    regex: /(?<![\u0600-\u06FF])(?:تجاهل|تجاوز|تخطّ|تخط|انس(?:ى)?|الغ(?:ي|اء)?|أبطل|تخلّ\s+عن|اصرف\s+النظر\s+عن)(?![\u0600-\u06FF])[\s\u0600-\u06FFa-zA-Z]{0,40}?(?:كل\s+التعليمات|التعليمات|الأوامر|القواعد|التوجيهات|البرومبت|الإرشادات|التوجّهات|التوجهات|التعليمات\s+السابقة|التعليمات\s+الأولى|التعليمات\s+التي|قواعدك)/i,
    weight: 0.95 },
  { name: 'ar_new_role',
    regex: /(?<![\u0600-\u06FF])(?:أنت\s+(?:الآن|من\s+الآن)|دورك\s+الجديد|تظاهر(?:\s+أنك)?|تخيل\s+أنك|العب\s+دور|تقمّص(?:\s+شخصية)?|كن\s+الآن)(?![\u0600-\u06FF])/i,
    weight: 0.85 },
  { name: 'ar_reveal_system',
    regex: /(?:اكشف|أظهر|اطبع|أعد|كرر|سرّب|اعرض|أرني|أعطني|قل\s+لي|شارك|أفصح\s+عن)[\s\u0600-\u06FFa-zA-Z]{0,30}?(?:تعليمات|توجيهات|البرومبت|نظام|الأوامر|القواعد|التوجّهات|الإرشادات|التكوين)/i,
    weight: 0.85 },
  { name: 'ar_reveal_hidden_rules',
    regex: /(?:القواعد\s+(?:المخفية|الخفية|السرية|التي\s+تتحكم)|التعليمات\s+(?:المخفية|الخفية|السرية))/i,
    weight: 0.95 },
  // ضيّقنا النمط ليتطلب اقتراناً صريحاً بـ "رد/جواب/إجابة" أو بأسلوب
  // الذكاء الاصطناعي/الفلتر/الرقابة فقط. "بدون قيود" بمفردها تستخدم بشكل
  // مشروع في أسئلة استثمار وأعمال (مثل: "استثمار بدون قيود قانونية").
  // ملاحظات: ندعم لاحقات الأفعال (ني، نا، ي، ه) مثل "أجبني/أجبنا"،
  // ونسمح بمكمّل اختياري بين النفي والاسم مثل "بدون أيّ قيود/بدون كل قيود".
  { name: 'ar_no_filter',
    regex: /(?:(?:رد|جواب|إجابة|أجب|اجب|أجيب|اجيب|تكلم|تحدث)(?:ني|نا|ي|ه)?\s+(?:بدون|دون|بلا|من\s+غير)\s+(?:(?:أي|اي|أيّ|كل|جميع|كافة)\s+)?(?:قيود|رقابة|فلتر|حدود|قواعد|أخلاق|ضوابط))|(?:(?:بدون|دون|بلا|من\s+غير)\s+(?:فلتر|رقابة|ضوابط\s+الذكاء|قيود\s+الذكاء|أخلاقيات\s+الذكاء))/i,
    weight: 0.9 },
  { name: 'ar_stop_being',
    regex: /(?:توقف\s+عن\s+كونك|لست\s+(?:مساعد|نموذج)|أنت\s+لست)/i,
    weight: 0.85 },
  { name: 'ar_unrestricted_ai',
    regex: /(?:مساعد|نموذج|بوت|روبوت)\s+(?:بدون|بلا|دون)\s+(?:قيود|حدود|رقابة|أخلاق)/i,
    weight: 0.95 },

  // --- عربي: تسريب ---
  { name: 'ar_print_history',
    regex: /(?:اطبع|أظهر|اعرض|أرني)[\s\u0600-\u06FFa-zA-Z]{0,15}?(?:المحادثة|الذاكرة|السياق|التاريخ|سجل\s+الدردشة)/i,
    weight: 0.7 },

  // --- متعدد اللغات: استدعاء `system:` ---
  { name: 'inline_system_prefix',
    regex: /^\s*(?:system|نظام|系统|sistema|système|admin)\s*:\s*\S/i,
    weight: 0.85 },

  // --- محاولات تنفيذ كود ضمن الموجّه (LLM07) ---
  { name: 'code_exec_eval',
    regex: /\b(?:eval|exec|system|shell|spawn|child_process|os\.system|subprocess)\s*\(/i,
    weight: 0.85 },
  { name: 'code_exec_dangerous',
    regex: /\b(?:rm\s+-rf|format\s+c:|del\s+\/s|drop\s+table|truncate\s+table)\b/i,
    weight: 0.95 },
  { name: 'code_exec_import',
    regex: /\b(?:require|__import__|importlib)\s*\(\s*["']/i,
    weight: 0.6 },

  // --- محاولات استخراج SSRF/Token (LLM02) ---
  { name: 'token_request',
    regex: /\b(?:api[\s_-]?key|secret|token|password|credential|env\s+var|environment\s+variable)s?\b[\s\w]{0,30}?\b(?:show|reveal|print|give|send|tell|share|leak|output|expose)/i,
    weight: 0.95 },
  { name: 'token_request_reverse',
    regex: /\b(?:show|reveal|print|give|send|tell|share|leak|output|expose)[\s\w]{0,30}?\b(?:api[\s_-]?key|secret|token|password|credential|env\s+var|environment\s+variable)s?\b/i,
    weight: 0.95 },

  // ============================================================
  // طبقة سياسة المحتوى (Content-Policy Defense-in-Depth)
  // ============================================================
  // ملاحظة معمارية: الأنماط أدناه ليست "حقن موجِّهات" بالمعنى الدقيق
  // (LLM01)؛ بل طلبات لتنفيذ مهام ضارّة/مخالفة لشروط الاستخدام.
  // الرفض النهائي يجب أن يحدث في طبقة المحتوى (system prompt + LLM
  // refusal)، لكن نضع طبقة بوابة دفاع متقدّمة لتقليل الـ blast radius
  // وتسجيل المحاولات في الـ audit trail قبل أن يصرف رصيد API.

  // --- تصعيد الصلاحيات (privilege escalation) ---
  { name: 'ar_grant_privileges',
    regex: /(?:أعطني|اعطني|امنحني|أمنحني|اديني|ادّيني|اعمل[\s\u0600-\u06FF]+(?:كـ)?)[\s\u0600-\u06FF]{0,30}?(?:صلاحيات|صلاحية|دور|حساب|وصول)\s*(?:admin|root|أدمن|إداري|اداري|مدير|مسؤول|كامل|مطلق)/i,
    weight: 0.95 },
  { name: 'en_grant_privileges',
    regex: /\b(?:give|grant|elevate|escalate)\s+me\s+(?:admin|root|superuser|sudo|owner|full|elevated|privileged)\s+(?:access|privileges?|rights?|permissions?|role|account)\b/i,
    weight: 0.95 },
  { name: 'ar_owner_claim',
    regex: /\b(?:أنا|انا)\s+(?:المالك|الـowner|owner|الأدمن|الادمن|الإداري|الاداري|المسؤول)\s+(?:الفعلي|الحقيقي|الأصلي|الاصلي)\b/i,
    weight: 0.85 },

  // --- التصيّد الإلكتروني (phishing) ---
  { name: 'ar_phishing',
    regex: /(?:خداع|تصيّد|تصيد|إيهام|ايهام|انتحال|احتيال)[\s\u0600-\u06FF]{0,40}?(?:بيانات|معلومات|كلمة\s+(?:سر|مرور)|بطاقة|بنكي|بنكية|اعتماد|دخول)|(?:سرقة|اخذ|أخذ)\s+(?:بيانات|كلمات\s+مرور|بطاقات)\s+(?:البنك|بنكية|الناس|المستخدمين)/i,
    weight: 0.95 },
  { name: 'en_phishing',
    regex: /\b(?:phishing|spoofing|impersonate|trick|deceive|fool)\b[\s\w]{0,40}?\b(?:credentials?|passwords?|bank|banking|account|login|payment\s+(?:details?|info)|credit\s+card)\b/i,
    weight: 0.95 },

  // --- التزوير والاحتيال المستندي (fraud/forgery) ---
  { name: 'ar_forgery',
    regex: /(?:تزوير|تزييف|تلفيق|اختلاق|فبركة)[\s\u0600-\u06FF]{0,30}?(?:سجل|مستند|وثيقة|عقد|بطاقة|توكيل|شهادة|فاتورة|إيصال|ايصال|توقيع|ختم|بصمة)/i,
    weight: 0.95 },
  { name: 'en_forgery',
    regex: /\b(?:forge|fake|fabricate|falsify|counterfeit)\s+(?:a\s+|an\s+|the\s+)?(?:document|signature|invoice|contract|receipt|certificate|record|registry|stamp|id|passport|license)\b/i,
    weight: 0.95 },

  // --- البريد المزعج / إرسال جماعي بلا موافقة (spam) ---
  { name: 'ar_spam_bot',
    regex: /(?:بوت|روبوت|سكريبت|أتمتة|اتمتة)[\s\u0600-\u06FF]{0,30}?(?:سبام|سپام|إعلانات|اعلانات|رسائل\s+(?:جماعية|تلقائية|كثيرة|تسويقية))|رسائل\s+(?:سبام|سپام)\s+(?:تلقائ|جماعي|بكميات)|إرسال\s+(?:جماعي|كميات)[\s\u0600-\u06FF]{0,20}?(?:بدون\s+(?:موافقة|إذن|اذن)|بلا\s+(?:موافقة|إذن|اذن))?/i,
    weight: 0.85 },
  { name: 'en_spam_bot',
    regex: /\b(?:spam|mass[\s-]?email|bulk[\s-]?(?:sms|email|message))\s+(?:bot|script|tool|campaign|users?|people|database|list)|automated\s+(?:spam|unsolicited)\s+(?:messages?|emails?|sms|calls?)/i,
    weight: 0.85 },

  // --- التهرّب الضريبي والتلاعب بالسجلات (tax fraud) ---
  { name: 'ar_tax_evasion',
    regex: /(?:إخفاء|اخفاء|تهرّب|تهرب|تجنب\s+قسري)[\s\u0600-\u06FF]{0,30}?(?:ضرائب|ضريبة|إيرادات|ايرادات|أرباح|ارباح)|(?:تزوير|تلاعب|تعديل|تخفيض\s+مزيف)[\s\u0600-\u06FF]{0,30}?(?:سجلات|دفاتر|حسابات|ميزانية|إقرار\s+ضريبي|اقرار\s+ضريبي)|(?:أرباح|ارباح)\s+(?:أقل|اقل|مزيفة|كاذبة|مخفّضة|وهمية)/i,
    weight: 0.9 },
  { name: 'en_tax_evasion',
    regex: /\b(?:hide|conceal|underreport|under-report|evade|cheat\s+on)\s+(?:taxes?|revenue|income|profits?|earnings)|cook\s+the\s+books|two\s+sets?\s+of\s+books|off[\s-]?the[\s-]?books\s+(?:income|sales?)/i,
    weight: 0.9 },
];

/** عتبة افتراضية للرفض — مجموع درجات الأنماط المطابقة. */
const DEFAULT_BLOCK_THRESHOLD = 0.7;

export interface PromptRiskReport {
  /** درجة خطر تراكمية (0..1+، قد تتجاوز 1 إذا تطابقت أنماط متعددة). */
  score: number;
  /** قائمة الأنماط المطابقة. */
  matched: Array<{ name: string; weight: number }>;
  /** هل النتيجة فوق العتبة؟ */
  blocked: boolean;
}

/**
 * يطبّع النص العربي قبل المقارنة:
 *   - يوحّد جميع أشكال الألف (أ، إ، آ، ا) إلى `ا`.
 *   - يوحّد التاء المربوطة (ة) إلى (ه).
 *   - يوحّد الياء (ى) إلى (ي).
 *   - يزيل التشكيل (الحركات).
 *
 * هذا يجعل القواعد قادرة على رصد المحاولات بصرف النظر عن دقة الكاتب
 * في رسم الهمزات أو إضافة التشكيل.
 */
function normalizeArabic(s: string): string {
  return s
    .replace(/[\u064B-\u0652\u0670]/g, '')   // إزالة التشكيل
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

export function scorePromptRisk(
  userInput: string,
  threshold: number = DEFAULT_BLOCK_THRESHOLD,
): PromptRiskReport {
  if (!userInput) return { score: 0, matched: [], blocked: false };

  // نفحص النصّ الأصلي + النسخة المطبَّعة عربياً، ثم نأخذ مجموع غير مكرَّر.
  const variants = [userInput, normalizeArabic(userInput)];
  const seen = new Set<string>();
  const matched: Array<{ name: string; weight: number }> = [];
  let score = 0;

  for (const variant of variants) {
    for (const p of INJECTION_PATTERNS) {
      if (seen.has(p.name)) continue;
      if (p.regex.test(variant)) {
        seen.add(p.name);
        matched.push({ name: p.name, weight: p.weight });
        score += p.weight;
      }
    }
  }
  return { score, matched, blocked: score >= threshold };
}

/**
 * البديل التوافقي للواجهة القديمة — تُعيد `false` إذا اعتُبر المدخل
 * محاولة حقن (يتطابق مع الاستخدام في `gateway.ts`).
 *
 * @param _systemPrompt غير مستخدم (للتوافق فقط — السياق الكامل
 *   مأخوذ من `userInput` لأن النظام يأتي من مكان موثوق).
 * @param userInput النص الذي يدخله المستخدم.
 */
export function validatePromptIntegrity(
  _systemPrompt: string,
  userInput: string,
): boolean {
  return !scorePromptRisk(userInput).blocked;
}

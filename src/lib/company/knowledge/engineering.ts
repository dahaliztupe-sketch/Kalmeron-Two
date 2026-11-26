import type { RoleKnowledge } from "./types";

/** Engineering practice. Each item is only what the opened page says. Advice for drafting, not a security audit. */
export const ENGINEERING_KNOWLEDGE: RoleKnowledge = {
  roleId: "engineering",
  maxAgeDays: 90,
  items: [
    {
      id: "test-pyramid",
      ruleAr: "اكتب اختبارات بدرجات تفصيل مختلفة: كثير من اختبارات الوحدة السريعة، وأقل منها اختبارات أوسع (تكامل)، وقليل جداً من اختبارات الواجهة الشاملة. الأسماء الدقيقة للطبقات ليست مهمة بقدر الشكل الهرمي.",
      sourceUrl: "https://martinfowler.com/articles/practical-test-pyramid.html",
      sourceTitle: "Ham Vocke، The Practical Test Pyramid (martinfowler.com)",
      sourceDate: "2018-02-26",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "dora-five-metrics",
      ruleAr: "DORA تقيس أداء تسليم البرمجيات بخمسة مقاييس، منها ثلاثة للإنتاجية: زمن التغيير من الإيداع حتى الإنتاج، وتكرار النشر، وزمن التعافي من نشر فاشل. تفيد فريقاً حقيقياً؛ لمؤسس منفرد في البداية هي اتجاه للمراقبة وليست هدفاً.",
      sourceUrl: "https://dora.dev/guides/dora-metrics/",
      sourceTitle: "DORA: software delivery performance metrics (Nathen Harvey)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "nist-ssdf",
      ruleAr: "إطار NIST SSDF (SP 800-218 الإصدار 1.1، فبراير 2022) مجموعة ممارسات عالية المستوى لتطوير آمن يمكن دمجها في أي دورة تطوير، تقلل الثغرات في الإصدارات وتعالج جذورها. هو إطار للمنتجين وليس قائمة فحص جاهزة ولا شهادة.",
      sourceUrl: "https://csrc.nist.gov/pubs/sp/800/218/final",
      sourceTitle: "NIST SP 800-218: Secure Software Development Framework (SSDF) Version 1.1",
      sourceDate: "2022-02-03",
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "owasp-top10",
      ruleAr: "OWASP Top 10 وثيقة توعية معيارية بأخطر مخاطر تطبيقات الويب، والصفحة تذكر أن أحدث إصدار منشور هو OWASP Top 10 2025. استخدمها نقطة بداية لقائمة المراجعة، ولا تعتمدها فحصاً أمنياً كاملاً.",
      sourceUrl: "https://owasp.org/www-project-top-ten/",
      sourceTitle: "OWASP Top 10 (OWASP Foundation)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "twelve-factor-list",
      ruleAr: "منهجية Twelve-Factor App لبناء تطبيقات الخدمة تضم اثني عشر عاملاً منها: قاعدة شيفرة واحدة تحت التحكم في الإصدارات، والتبعيات، والإعدادات، والخدمات الداعمة، والفصل بين البناء والإصدار والتشغيل. استخدمها مرجعاً للتنظيم لا كشرط.",
      sourceUrl: "https://12factor.net/",
      sourceTitle: "The Twelve-Factor App",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
  ],
  workflowAr: [
    "ابدأ من خطة المنتج (أصغر نسخة قابلة للتجربة) ولا تضف مكونات لا يحتاجها المنتج الأول.",
    "اقترح بنية بسيطة ومكدساً (stack) قليل الأجزاء، وسمِّ سبب كل اختيار ووسمه basis؛ لا تعد بأسماء أسعار أو حدود خدمات لم تُعطَ لك.",
    "قسّم البناء إلى معالم أسبوعية قصيرة ضمن المدة والميزانية، لكل معلم مخرج يمكن التحقق منه.",
    "خطة اختبار بشكل هرمي: وحدات أولاً ثم تكامل ثم قليل من الاختبارات الشاملة، مع ما يُختبر يدوياً.",
    "قائمة أمان وتشغيل: إدارة الأسرار خارج الشيفرة، صلاحيات أقل ما يلزم، تحديث التبعيات، نسخ احتياطي، تسجيل أخطاء، خطوات النشر والتراجع.",
    "لا تضع مفاتيح أو كلمات مرور في أي مخرج. لا تنشر ولا تدفع ولا تنشئ حسابات؛ الخطة فقط.",
    "مسائل البيانات الشخصية والعقود تذهب إلى handoff لدور legal، والتكلفة التفصيلية لدور finance.",
  ],
};

"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "ما هو الرصيد وكيف يُحسب؟",
    a: "كل تفاعل مع وكلاء كلميرون يستهلك عدداً صغيراً من الرصيد (عادةً 5 رصيد لكل رسالة في المساعد). الخطة المجانية تمنحك 200 رصيد يومياً و3,000 شهرياً — أي ما يعادل تقريباً 600 رسالة شهرية تكفي معظم رواد الأعمال للبدء.",
  },
  {
    q: "هل يمكنني الترقية أو التخفيض في أي وقت؟",
    a: "نعم. التغييرات تُطبَّق فوراً، ونمنحك الأرصدة الجديدة في نفس اللحظة عند الترقية. عند التخفيض يبقى الرصيد المتبقي حتى نهاية الدورة الحالية.",
  },
  {
    q: "ماذا يحدث إذا تجاوزت الحد الشهري؟",
    a: "ستتلقى تنبيهاً عند 80% من حدّك، ونوقف الاستهلاك مؤقتاً عند 100%. يمكنك حينها الترقية لخطة أعلى أو الانتظار حتى التجديد التلقائي في الشهر الجديد.",
  },
  {
    q: "هل هناك ضمان استرداد؟",
    a: "نعم. نقدّم ضمان استرداد كامل خلال أول 30 يوماً من الاشتراك المدفوع، بدون أي أسئلة.",
  },
  {
    q: "هل بياناتي ومحادثاتي آمنة؟",
    a: "بالتأكيد. كل البيانات مشفرة بـ AES-256 في حالتي السكون والنقل، ومتوافقة مع GDPR وقانون حماية البيانات المصري. لن نستخدم بياناتك أبداً لتدريب نماذجنا.",
  },
  {
    q: "هل أحتاج لبطاقة ائتمان للبدء؟",
    a: "لا. الخطة المجانية كاملة وسخية ولا تحتاج لأي بطاقة. ستحتاج للبطاقة فقط عند الترقية لخطة مدفوعة.",
  },
  {
    q: "كيف أتواصل لخطة المؤسسات؟",
    a: "اضغط على زر «تواصل مع المبيعات» في خطة المؤسسات وسيتواصل معك فريقنا خلال 24 ساعة لتفصيل خطة تناسب مؤسستك.",
  },
];

export function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold font-bold mb-2">
          أسئلة شائعة
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
          كل ما تحتاج معرفته
        </h2>
      </motion.div>

      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={cn(
                "rounded-2xl border bg-dark-surface/40 backdrop-blur-md overflow-hidden transition-colors",
                isOpen ? "border-brand-gold/30" : "border-white/[0.06] hover:border-white/15"
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right"
              >
                <span className="font-bold text-white text-sm md:text-base">{f.q}</span>
                <span
                  className={cn(
                    "shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all",
                    isOpen
                      ? "bg-brand-gold border-brand-gold text-black rotate-45"
                      : "border-white/15 text-text-secondary"
                  )}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </button>
              <div className="faq-content" data-open={isOpen}>
                <div>
                  <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                    {f.a}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 text-center rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-brand-gold/5 via-transparent to-brand-blue/5 p-8 md:p-12"
      >
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3">
          لسه عندك سؤال؟
        </h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto text-sm">
          فريقنا متاح للإجابة عن أي سؤال يخص الخطط أو الميزات.
        </p>
        <a
          href="mailto:hello@kalmeron.com"
          className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-6 py-3 text-sm font-bold text-brand-gold hover:bg-brand-gold/20 transition-all"
        >
          تواصل معنا
        </a>
      </motion.div>
    </section>
  );
}

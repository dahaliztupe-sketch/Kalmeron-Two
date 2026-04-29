"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) {
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999]"
          dir="rtl"
          role="dialog"
          aria-label="إشعار الكوكيز"
        >
          <div className="rounded-2xl border border-white/[0.10] bg-[#0C0F1A]/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Cookie className="h-4 w-4 text-brand-cyan shrink-0" />
                <span className="text-sm font-bold text-white">نستخدم ملفات الكوكيز</span>
              </div>
              <button
                onClick={decline}
                aria-label="إغلاق"
                className="text-neutral-500 hover:text-white transition-colors mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              نستخدم ملفات الكوكيز لتحسين تجربتك وتحليل حركة المرور وفق{" "}
              <Link href="/privacy" className="text-brand-cyan underline hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>{" "}
              والامتثال للائحة GDPR وقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={accept}
                className="flex-1 rounded-xl bg-brand-cyan text-black text-sm font-bold py-2 hover:bg-cyan-300 transition-colors"
              >
                أوافق على الكل
              </button>
              <button
                onClick={decline}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 text-sm font-medium py-2 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                الضروري فقط
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

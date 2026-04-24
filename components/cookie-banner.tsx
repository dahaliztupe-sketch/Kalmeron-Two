"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

export function CookieBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    timeout = setTimeout(() => {
      setIsMounted(true);
      if (!localStorage.getItem("cookieConsent")) {
        setShow(true);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!isMounted) return null;

  const accept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800 z-50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          dir="rtl"
        >
          <div className="text-sm text-neutral-300">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتحليل حركة المرور، وفقاً للائحة العامة لحماية البيانات (GDPR) وقانون حماية البيانات الشخصية المصري. استمرارك يعني موافقتك.
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={() => setShow(false)}>أرفض</Button>
            <Button variant="default" onClick={accept} className="bg-[rgb(var(--brand-cyan))] text-black hover:bg-yellow-600">أوافق</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

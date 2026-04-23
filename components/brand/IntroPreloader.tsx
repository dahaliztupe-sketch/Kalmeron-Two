"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedBrandMark } from "./AnimatedBrandMark";

const STORAGE_KEY = "kalmeron_intro_played_v1";

/**
 * Site-wide intro preloader. Plays once per session (sessionStorage),
 * locks scroll while visible, and fades out cleanly.
 */
export function IntroPreloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {}
    setShow(true);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      document.body.style.overflow = "";
    }, 2600);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#05070D]"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.18), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(232,121,249,0.16), transparent 55%)",
            }}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <AnimatedBrandMark size={150} halo glow />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <span className="font-display text-2xl font-black uppercase text-white tracking-[0.35em]">
                KALMERON
              </span>
              <span className="mt-2 text-[11px] uppercase tracking-[0.4em] text-cyan-300/80">
                AI&nbsp;·&nbsp;Studio
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

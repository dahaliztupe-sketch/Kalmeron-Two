"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X } from "lucide-react";

const COLORS = [
  "#7c3aed", "#a855f7", "#06b6d4", "#10b981",
  "#f59e0b", "#f43f5e", "#8b5cf6", "#3b82f6",
];

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
}

function usePieces(count = 60): Piece[] {
  const ref = useRef<Piece[] | null>(null);
  if (!ref.current) {
    ref.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.floor(Math.random() * 100),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: Math.floor(Math.random() * 8) + 6,
      delay: Math.random() * 0.8,
      duration: Math.random() * 1.5 + 1.5,
      rotate: Math.floor(Math.random() * 360),
    }));
  }
  return ref.current;
}

export function UpgradeConfetti() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const pieces = usePieces(60);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setVisible(true);
      setShowToast(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("upgraded");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
      const timer = setTimeout(() => setVisible(false), 3500);
      const toastTimer = setTimeout(() => setShowToast(false), 6000);
      return () => { clearTimeout(timer); clearTimeout(toastTimer); };
    }
    return undefined;
  }, [searchParams, router]);

  return (
    <>
      {/* Confetti pieces */}
      <AnimatePresence>
        {visible && (
          <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
            {pieces.map((p) => (
              <motion.div
                key={p.id}
                initial={{ y: -20, opacity: 1, rotate: 0, x: `${p.x}vw` }}
                animate={{
                  y: "110vh",
                  opacity: [1, 1, 0.8, 0],
                  rotate: p.rotate + 720,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeIn",
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  width: p.size,
                  height: p.size * 0.6,
                  borderRadius: 2,
                  backgroundColor: p.color,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-[400] flex items-center gap-3 px-5 py-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-l from-emerald-500/10 to-violet-500/10 backdrop-blur-md shadow-2xl"
            dir="rtl"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">🎉 تم تفعيل اشتراكك بنجاح!</p>
              <p className="text-neutral-400 text-xs mt-0.5">استمتع بجميع مزايا الباقة الجديدة</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

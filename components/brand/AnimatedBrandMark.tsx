"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  className?: string;
  /** loop the draw animation continuously */
  loop?: boolean;
  /** show the rotating conic halo behind the mark */
  halo?: boolean;
  /** show the soft pulsing glow */
  glow?: boolean;
};

const FRONT_PATH = "M 28 64 L 28 38 Q 28 28 38 28 L 74 28 Q 84 28 84 38 L 84 56";
const BACK_PATH  = "M 92 56 L 92 82 Q 92 92 82 92 L 46 92 Q 36 92 36 82 L 36 64";

export function AnimatedBrandMark({
  size = 120,
  className,
  loop = false,
  halo = true,
  glow = true,
}: Props) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {halo && (
        <motion.div
          aria-hidden
          className="absolute inset-[-18%] rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(56,189,248,0.0), rgba(56,189,248,0.55), rgba(139,92,246,0.55), rgba(232,121,249,0.55), rgba(56,189,248,0.0))",
            filter: "blur(18px)",
            opacity: 0.55,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        />
      )}

      {glow && (
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(79,70,229,0.45), rgba(79,70,229,0) 70%)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
        />
      )}

      <svg
        viewBox="0 0 120 120"
        className="relative w-full h-full"
        fill="none"
        role="img"
        aria-label="Kalmeron AI"
      >
        <defs>
          <linearGradient id="amk-top" x1="20%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="45%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="amk-bot" x1="10%" y1="90%" x2="90%" y2="10%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>
          <radialGradient id="amk-spark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <filter id="amk-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* BACK hook (drawn first, behind) */}
        <path
          d={BACK_PATH}
          stroke="url(#amk-bot)"
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          className={cn("draw-path-anim", loop && "loop")}
        />
        {/* FRONT hook (drawn slightly delayed for woven feel) */}
        <path
          d={FRONT_PATH}
          stroke="url(#amk-top)"
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          className={cn("draw-path-anim delayed", loop && "loop")}
        />

        {/* center spark */}
        <motion.g
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: [0.4, 1.25, 1] }}
          transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
        >
          <circle cx="60" cy="60" r="14" fill="url(#amk-spark)" filter="url(#amk-blur)" />
          <circle cx="60" cy="60" r="3.4" fill="#ffffff" />
          <circle cx="60" cy="60" r="1.4" fill="#E0F2FE" />
        </motion.g>
      </svg>
    </div>
  );
}

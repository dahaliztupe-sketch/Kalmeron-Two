// @ts-nocheck
import { motion } from 'framer-motion';

export function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      className={`backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl shadow-2xl ${className || ''}`}
      whileHover={{ boxShadow: "0 25px 40px -12px rgba(0,0,0,0.6)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

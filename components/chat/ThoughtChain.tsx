"use client";

import { motion, AnimatePresence } from "motion/react";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";

export type Phase = { id: string; label: string };

interface Props {
  phases?: Phase[];
  done?: boolean;
}

const FALLBACK_PHASE: Phase = { id: 'router', label: 'تحليل نيتك...' };

export function ThoughtChain({ phases, done = false }: Props) {
  const list: Phase[] = phases && phases.length ? phases : [FALLBACK_PHASE];
  const lastIdx = list.length - 1;

  return (
    <div className="space-y-2 py-1">
      <AnimatePresence initial={false}>
        {list.map((p, i) => {
          const isLast = i === lastIdx;
          const isCompleted = !isLast || done;
          return (
            <motion.div
              key={p.id + i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 text-sm"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin shrink-0" />
              )}
              <span className={isCompleted ? "text-text-secondary/60" : "text-white"}>
                {p.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function CompactThoughtSummary({ count }: { count: number }) {
  return (
    <button className="text-xs text-text-secondary/70 hover:text-white inline-flex items-center gap-1.5">
      <Brain className="w-3 h-3" />
      تم استخدام {count} خطوة تفكير — اضغط للعرض
    </button>
  );
}

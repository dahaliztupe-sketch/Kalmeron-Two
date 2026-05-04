"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type Phase = { id: string; label: string };

interface Props {
  phases?: Phase[];
  done?: boolean;
}

const FALLBACK_PHASE: Phase = { id: "router", label: "تحليل نيتك..." };

export function ThoughtChain({ phases, done = false }: Props) {
  const list: Phase[] = phases && phases.length ? phases : [FALLBACK_PHASE];
  const lastIdx = list.length - 1;
  const [expanded, setExpanded] = useState(true);

  const completedCount = done ? list.length : Math.max(list.length - 1, 0);
  const activeLabel = !done && list.length > 0 ? list[lastIdx].label : null;

  if (done && list.length > 0) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <Brain className="w-3 h-3 shrink-0 text-indigo-400/70" />
          <span className="flex-1 text-right">
            {completedCount} خطوة تفكير مكتملة
          </span>
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-2 space-y-1.5 border-t border-white/[0.04]">
                {list.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400/70 shrink-0" />
                    <span className="text-neutral-500">{p.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 py-1">
      <AnimatePresence initial={false}>
        {list.map((p, i) => {
          const isLast = i === lastIdx;
          const isCompleted = !isLast || done;
          return (
            <motion.div
              key={p.id + i}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 text-xs"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Loader2
                  className={cn(
                    "w-3.5 h-3.5 shrink-0 animate-spin",
                    isLast ? "text-cyan-400" : "text-neutral-500"
                  )}
                />
              )}
              <span
                className={cn(
                  "transition-colors",
                  isLast && !done
                    ? "text-cyan-200 font-medium"
                    : "text-neutral-500"
                )}
              >
                {p.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!done && activeLabel && (
        <div className="flex items-center gap-1.5 pl-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse [animation-delay:200ms]" />
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse [animation-delay:400ms]" />
        </div>
      )}
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

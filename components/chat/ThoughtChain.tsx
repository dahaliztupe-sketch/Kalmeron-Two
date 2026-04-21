"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Brain, Sparkles, CheckCircle2 } from "lucide-react";

const PHASES = [
  { id: 'route',    label: 'تحليل نيتك...',                     Icon: Brain,    delay: 800 },
  { id: 'context',  label: 'استدعاء سياق ذاكرتك...',           Icon: FileText, delay: 1500 },
  { id: 'research', label: 'البحث في قاعدة المعرفة...',       Icon: Search,   delay: 2200 },
  { id: 'compose',  label: 'صياغة الرد بأفضل صيغة...',        Icon: Sparkles, delay: 1500 },
];

export function ThoughtChain() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let idx = 0;
    const ids: any[] = [];
    const advance = () => {
      if (idx >= PHASES.length - 1) return;
      const t = setTimeout(() => {
        idx += 1;
        setActiveIdx(idx);
        advance();
      }, PHASES[idx].delay);
      ids.push(t);
    };
    advance();
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-2 py-1">
      {PHASES.map((p, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        const upcoming = i > activeIdx;
        return (
          <AnimatePresence key={p.id}>
            {!upcoming && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2.5 text-sm"
              >
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <p.Icon className="w-3.5 h-3.5 text-brand-blue animate-pulse shrink-0" />
                )}
                <span className={done ? "text-text-secondary/60 line-through" : "text-white"}>
                  {p.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
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

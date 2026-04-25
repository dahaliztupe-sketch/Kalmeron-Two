"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Brain, RotateCcw, Sparkles } from "lucide-react";
import type { DemoScenario, DemoMessage } from "@/app/demo/scenarios";
import { cn } from "@/src/lib/utils";

interface Props {
  scenario: DemoScenario;
}

const AGENT_ACCENT: Record<string, string> = {
  "idea-validator": "from-cyan-500/20 to-cyan-500/5 text-cyan-200 border-cyan-500/30",
  "plan-builder": "from-amber-500/20 to-amber-500/5 text-amber-200 border-amber-500/30",
  "cfo-agent": "from-emerald-500/20 to-emerald-500/5 text-emerald-200 border-emerald-500/30",
  "legal-guide": "from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-500/30",
  "mistake-shield": "from-rose-500/20 to-rose-500/5 text-rose-200 border-rose-500/30",
};

/**
 * Plays a scenario as a sequence of agent "thinking → speaking" cards.
 *
 * The animation is *time-based* (not LLM-driven): each message has a
 * fixed `delayMs` so investors get an identical 3-minute walkthrough every
 * time. Users can replay or skip ahead.
 */
export function ScenarioPlayer({ scenario }: Props) {
  const [visible, setVisible] = useState<number>(0);
  const [thinking, setThinking] = useState<DemoMessage | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Schedule the messages.
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisible(0);
    setThinking(null);

    let acc = 0;
    scenario.messages.forEach((msg, idx) => {
      acc += msg.delayMs;
      // Show "thinking" pill 600ms before the agent message arrives.
      if (msg.role === "agent") {
        const tShow = acc - 600;
        if (tShow > 0) {
          timersRef.current.push(
            setTimeout(() => setThinking(msg), tShow),
          );
        }
      }
      timersRef.current.push(
        setTimeout(() => {
          setVisible(idx + 1);
          setThinking(null);
          requestAnimationFrame(() => {
            containerRef.current?.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: "smooth",
            });
          });
        }, acc),
      );
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [scenario.id]);

  const replay = () => setVisible(0);
  const skipToEnd = () => {
    timersRef.current.forEach(clearTimeout);
    setThinking(null);
    setVisible(scenario.messages.length);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0B1020]/80 to-[#070A18]/80 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-black/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-2xl">{scenario.emoji}</div>
          <div className="min-w-0">
            <h3 className="font-display text-base md:text-lg font-extrabold text-white truncate">
              {scenario.titleAr}
            </h3>
            <p className="text-[11px] uppercase tracking-widest text-text-secondary">
              {scenario.industryAr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={skipToEnd}
            disabled={visible === scenario.messages.length}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-white hover:border-white/20 disabled:opacity-30"
          >
            تخطّى
          </button>
          <button
            onClick={replay}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-white hover:border-white/20 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" /> أعد التشغيل
          </button>
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={containerRef}
        className="max-h-[560px] overflow-y-auto px-4 md:px-6 py-5 space-y-4"
        dir="rtl"
      >
        {scenario.messages.slice(0, visible).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "agent" && (
              <div
                className={cn(
                  "shrink-0 w-9 h-9 rounded-xl border bg-gradient-to-br flex items-center justify-center",
                  AGENT_ACCENT[msg.agent || ""] ||
                    "from-white/10 to-white/[0.02] border-white/10 text-white",
                )}
              >
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed",
                msg.role === "user"
                  ? "bg-white text-black font-medium"
                  : "bg-white/[0.04] border border-white/10 text-white/90",
              )}
            >
              {msg.role === "agent" && msg.agentDisplayAr && (
                <div className="text-[11px] uppercase tracking-widest text-text-secondary mb-1.5 font-bold">
                  {msg.agentDisplayAr}
                </div>
              )}
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-table:my-2 prose-li:my-0">
                <ReactMarkdown>{msg.body}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 text-xs text-text-secondary px-2"
            >
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {thinking.agentDisplayAr} يفكّر…
              </span>
              <span className="flex gap-1 ms-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:120ms]" />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:240ms]" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Outcome */}
      {visible === scenario.messages.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-white/10 px-5 py-4 bg-emerald-500/[0.04]"
          dir="rtl"
        >
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1.5">
            نتيجة الجلسة
          </p>
          <p className="text-sm text-white/90 leading-relaxed">
            {scenario.outcomeAr}
          </p>
        </motion.div>
      )}
    </div>
  );
}

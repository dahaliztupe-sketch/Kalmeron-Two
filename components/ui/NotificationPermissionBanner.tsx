"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { cn } from "@/src/lib/utils";

interface Props {
  userId?: string;
  className?: string;
}

export function NotificationPermissionBanner({ userId, className }: Props) {
  const { permission, loading, enable } = usePushNotifications(userId);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const shouldShow = mounted && permission === "default" && !dismissed;

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-2xl",
          "bg-gradient-to-l from-indigo-600/15 to-cyan-600/10",
          "border border-indigo-500/25",
          "text-sm",
          className
        )}
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-indigo-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-xs leading-tight">
            فعّل تنبيهات رادار الفرص
          </p>
          <p className="text-neutral-400 text-[11px] mt-0.5 leading-tight">
            كن أول من يعرف بفرص التمويل والمنح والفعاليات الجديدة
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={enable}
            disabled={loading}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-xl transition-all",
              "bg-indigo-600 hover:bg-indigo-500 text-white",
              "disabled:opacity-50"
            )}
          >
            {loading ? "جاري..." : "فعّل"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface InlineButtonProps {
  userId?: string;
  className?: string;
}

export function NotificationToggleButton({ userId, className }: InlineButtonProps) {
  const { permission, loading, enable } = usePushNotifications(userId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (permission === "granted") {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-emerald-400", className)}>
        <Bell className="w-3.5 h-3.5" />
        <span>التنبيهات مفعّلة</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-neutral-500", className)}>
        <BellOff className="w-3.5 h-3.5" />
        <span>التنبيهات معطّلة من المتصفح</span>
      </div>
    );
  }

  return (
    <button
      onClick={enable}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200",
        "transition-colors disabled:opacity-50",
        className
      )}
    >
      <Bell className="w-3.5 h-3.5" />
      {loading ? "جاري التفعيل..." : "فعّل التنبيهات"}
    </button>
  );
}

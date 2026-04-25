"use client";

import { Zap, Brain } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type ResponseMode = "fast" | "deep";

interface Props {
  value: ResponseMode;
  onChange: (mode: ResponseMode) => void;
  /** Optional inline density variant for chat header strips. */
  compact?: boolean;
  disabled?: boolean;
}

/**
 * Lets the user pick between:
 *
 * - **fast**  — single-model response, ~1-2s, good for follow-ups & light Qs.
 * - **deep**  — full Council (router + experts + structured deliberation),
 *               ~6-12s, used for strategic / complex questions.
 *
 * The toggle is purely a UX hint — the server still receives the value and
 * may downgrade `deep` → `fast` when the user is rate-limited.
 */
export function ResponseModeToggle({
  value,
  onChange,
  compact = false,
  disabled = false,
}: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="نمط الردّ"
      className={cn(
        "inline-flex rounded-2xl border border-white/10 bg-white/[0.03] p-1",
        compact ? "text-[11px]" : "text-xs",
      )}
    >
      <ModeBtn
        active={value === "fast"}
        onClick={() => onChange("fast")}
        disabled={disabled}
        icon={<Zap className="w-3 h-3" />}
        label="سريع"
        hint="~ 2 ثانية"
        compact={compact}
      />
      <ModeBtn
        active={value === "deep"}
        onClick={() => onChange("deep")}
        disabled={disabled}
        icon={<Brain className="w-3 h-3" />}
        label="مجلس عميق"
        hint="~ 8 ثوانٍ"
        compact={compact}
      />
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  disabled,
  icon,
  label,
  hint,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  hint: string;
  compact: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl px-3 transition flex items-center gap-1.5 font-bold",
        compact ? "py-1" : "py-1.5",
        active
          ? "bg-white text-black shadow"
          : "text-text-secondary hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {icon}
      <span>{label}</span>
      {!compact && (
        <span className="text-[10px] font-medium opacity-70 hidden md:inline">
          ({hint})
        </span>
      )}
    </button>
  );
}

import { Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "cyan" | "amber" | "emerald" | "fuchsia";
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<EyebrowProps["tone"]>, string> = {
  cyan: "text-cyan-300 border-cyan-300/20",
  amber: "text-amber-300 border-amber-300/20",
  emerald: "text-emerald-300 border-emerald-300/20",
  fuchsia: "text-fuchsia-300 border-fuchsia-300/20",
};

export function Eyebrow({
  children,
  icon: Icon = Sparkles,
  tone = "cyan",
  className,
}: EyebrowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{children}</span>
    </div>
  );
}

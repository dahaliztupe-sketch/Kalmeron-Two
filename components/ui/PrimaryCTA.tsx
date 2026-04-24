import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface PrimaryCTAProps {
  href: string;
  children: React.ReactNode;
  size?: "md" | "lg";
  /** إخفاء السهم */
  noArrow?: boolean;
  className?: string;
}

/**
 * CTA رئيسي موحّد مدعوم بمبادئ:
 * - Fitts's Law: حجم كبير + مساحة لمس واسعة
 * - Visual Affordance: تدرّج لوني واضح + ظلّ موضعي
 * - RTL-aware: السهم يشير لليسار في RTL ليعكس "إلى الأمام"
 */
export function PrimaryCTA({
  href,
  children,
  size = "md",
  noArrow = false,
  className,
}: PrimaryCTAProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold transition-all hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]",
        size === "md" && "px-6 py-3 text-base shadow-lg shadow-cyan-500/20",
        size === "lg" && "px-8 py-4 text-lg shadow-xl shadow-cyan-500/25",
        className
      )}
    >
      <span>{children}</span>
      {!noArrow && (
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      )}
    </Link>
  );
}

interface SecondaryCTAProps {
  href: string;
  children: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}

/** CTA ثانوي — أصغر بصرياً وزخماً (Fitts's Law: الأهم أكبر). */
export function SecondaryCTA({
  href,
  children,
  size = "md",
  className,
}: SecondaryCTAProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 font-medium hover:bg-white/10 hover:border-white/20 transition-colors",
        size === "md" && "px-6 py-3 text-base",
        size === "lg" && "px-8 py-4 text-lg",
        className
      )}
    >
      {children}
    </Link>
  );
}

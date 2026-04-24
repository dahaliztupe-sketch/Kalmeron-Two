import { cn } from "@/lib/utils";

interface CalmCardProps {
  children: React.ReactNode;
  /** أيقونة اختيارية تظهر أعلى البطاقة */
  icon?: React.ComponentType<{ className?: string }>;
  /** عنوان فرعي */
  title?: string;
  /** نص داعم */
  description?: string;
  /** نمط أبسط (بدون رسم رأسي للأيقونة) */
  variant?: "default" | "subtle";
  className?: string;
}

/**
 * بطاقة هادئة بصرياً — بديل rounded-2xl المتكرّر بتفاصيل مخفّفة.
 * - أقل ظلال، أقل حواف، تنفّس أكبر داخلي
 * - Cognitive Load: تقلّل العناصر البصرية المتنافسة
 */
export function CalmCard({
  children,
  icon: Icon,
  title,
  description,
  variant = "default",
  className,
}: CalmCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-colors",
        variant === "default" &&
          "bg-white/[0.03] border border-white/10 hover:border-white/20",
        variant === "subtle" && "bg-white/[0.02] border border-white/5",
        className
      )}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/10 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-cyan-300" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}

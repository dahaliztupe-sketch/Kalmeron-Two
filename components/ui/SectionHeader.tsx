import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** الإيبرو القصير فوق العنوان */
  eyebrow?: string;
  /** العنوان الرئيسي للقسم */
  title: string;
  /** فقرة وصف موجزة (≤ 24 كلمة) */
  description?: string;
  /** محاذاة المحتوى */
  align?: "start" | "center";
  className?: string;
}

/**
 * رأس قسم بإيقاع موحّد.
 * - مساحات تنفّس متّسقة (mb-12)
 * - عنوان واحد لكل قسم (Hick's Law)
 * - فقرة موجزة لتقليل الحمل الإدراكي
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "mb-12 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/80 mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-zinc-400 leading-relaxed">{description}</p>
      )}
    </header>
  );
}

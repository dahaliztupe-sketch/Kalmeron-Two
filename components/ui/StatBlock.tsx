import { cn } from "@/lib/utils";

interface StatBlockProps {
  /** الرقم الكبير الواضح */
  value: string;
  /** سياق قصير يُعطي معنى للرقم */
  label: string;
  /** ملاحظة سفلية (اختياري) */
  note?: string;
  className?: string;
}

/**
 * بلوك إحصائي موحّد.
 * - Anchoring (Tversky & Kahneman): الرقم أوّلاً، التفسير ثانياً
 * - Picture Superiority Effect: الرقم بحجم استثنائي يصبح صورة ذهنية
 */
export function StatBlock({ value, label, note, className }: StatBlockProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-cyan-300 to-indigo-400 bg-clip-text text-transparent leading-none">
        {value}
      </div>
      <div className="text-sm text-zinc-300 font-medium">{label}</div>
      {note && <div className="text-xs text-zinc-500">{note}</div>}
    </div>
  );
}

interface StatGridProps {
  stats: Array<{ value: string; label: string; note?: string }>;
  /** الحد الأقصى 4 لاحترام Miller's Law */
  className?: string;
}

export function StatGrid({ stats, className }: StatGridProps) {
  const safe = stats.slice(0, 4);
  return (
    <div
      className={cn(
        "grid gap-8",
        safe.length === 2 && "grid-cols-2",
        safe.length === 3 && "grid-cols-2 md:grid-cols-3",
        safe.length === 4 && "grid-cols-2 md:grid-cols-4",
        className
      )}
    >
      {safe.map((s) => (
        <StatBlock key={s.label} {...s} />
      ))}
    </div>
  );
}

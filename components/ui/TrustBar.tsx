import { ShieldCheck, Globe2, CreditCard, Languages } from "lucide-react";
import { TRUST } from "@/src/lib/copy/microcopy";

const ITEMS = [
  { icon: Globe2, label: TRUST.label },
  { icon: CreditCard, label: TRUST.noCard },
  { icon: Languages, label: TRUST.arabicNative },
  { icon: ShieldCheck, label: TRUST.privateData },
];

/**
 * شريط الثقة — يظهر فوق الـ fold لتقليل القلق وتسريع القرار.
 * - Social Proof (Cialdini): "موثوق من 12 دولة"
 * - Loss-Aversion mitigation: "بدون بطاقة" يزيل المخاطر المتصوّرة
 */
export function TrustBar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500"
          : "flex flex-wrap items-center justify-start gap-x-6 gap-y-3 text-sm text-zinc-400"
      }
    >
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <item.icon className="w-4 h-4 text-cyan-400/80 flex-shrink-0" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

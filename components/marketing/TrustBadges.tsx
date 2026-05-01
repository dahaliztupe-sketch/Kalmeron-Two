"use client";

import { ShieldCheck, FileCheck2, Scale, Lock } from "lucide-react";

export interface TrustBadgesProps {
  variant?: "row" | "stack";
  className?: string;
}

const BADGES = [
  {
    icon: Scale,
    title: "حماية البيانات الدولية",
    subtitle: "متوافق مع تشريعات حماية البيانات العالمية",
  },
  {
    icon: ShieldCheck,
    title: "PDPL السعودي",
    subtitle: "نظام حماية البيانات الشخصية",
  },
  {
    icon: FileCheck2,
    title: "GDPR Ready",
    subtitle: "قابل للتصدير + الحذف الذاتي",
  },
  {
    icon: Lock,
    title: "تشفير TLS 1.3 + AES-256",
    subtitle: "في النقل وفي السكون",
  },
];

/**
 * TrustBadges — Quick-Win QW-2 from the 45-expert business audit.
 * Renders the four compliance pillars Kalmeron leans on. Use in Footer,
 * pricing page, or anywhere conversion-sensitive.
 */
export function TrustBadges({ variant = "row", className = "" }: TrustBadgesProps) {
  const containerClass =
    variant === "row"
      ? "grid grid-cols-2 md:grid-cols-4 gap-3"
      : "flex flex-col gap-3";
  return (
    <div className={`${containerClass} ${className}`} dir="rtl">
      {BADGES.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.title}
            className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
          >
            <div className="shrink-0 rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-white leading-tight">{b.title}</div>
              <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">{b.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

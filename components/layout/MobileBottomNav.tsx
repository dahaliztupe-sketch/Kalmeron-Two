"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard, MessageSquareText, FlaskConical, Building2, Menu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
};

const ITEMS: Item[] = [
  { href: "/dashboard",  label: "الرئيسية", icon: LayoutDashboard },
  { href: "/departments",label: "أقسامي",   icon: Building2 },
  { href: "/chat",       label: "المساعد",  icon: MessageSquareText, primary: true },
  { href: "/lab",        label: "المختبر",  icon: FlaskConical },
  { href: "__menu__",    label: "المزيد",   icon: Menu },
];

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقل السفلي"
    >
      <div className="mx-3 mb-3 rounded-[26px] border border-white/10 bg-[#0A0F1F]/95 backdrop-blur-2xl shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <ul className="grid grid-cols-5 items-end px-2 pt-2 pb-2">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const isMenu = it.href === "__menu__";
            const active = !isMenu && (pathname === it.href || pathname.startsWith(it.href + "/"));

            const inner = (
              <div className="relative flex flex-col items-center justify-center py-1.5 px-1 gap-0.5">
                {it.primary ? (
                  <div className="-mt-7">
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-fuchsia flex items-center justify-center shadow-[0_8px_28px_-4px_rgba(79,70,229,0.65)] border border-white/20">
                      <span className="absolute -inset-1 rounded-2xl bg-brand-indigo/30 blur-lg" />
                      <Icon className="w-6 h-6 text-white relative z-10" />
                    </div>
                    <span className="block text-center text-[10px] mt-1 font-semibold text-white/70">{it.label}</span>
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                      active ? "bg-brand-indigo/20 border border-brand-indigo/35" : ""
                    )}>
                      <Icon className={cn(
                        "w-[18px] h-[18px] transition-colors duration-200",
                        active ? "text-brand-cyan" : "text-white/30"
                      )} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold transition-colors duration-200",
                      active ? "text-white" : "text-white/30"
                    )}>
                      {it.label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottomNavDot"
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-cyan"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </div>
            );

            return (
              <li key={it.href}>
                {isMenu ? (
                  <button onClick={onOpenMenu} className="w-full active:scale-90 transition-transform" aria-label="القائمة">
                    {inner}
                  </button>
                ) : (
                  <Link href={it.href} className="block active:scale-90 transition-transform" aria-label={it.label}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

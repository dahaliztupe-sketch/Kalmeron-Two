"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  MessageSquareText,
  Building2,
  Lightbulb,
  Menu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
  matchPrefix?: string;
};

const ITEMS: Item[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard, matchPrefix: "/dashboard" },
  { href: "/company-builder", label: "شركتي", icon: Building2, matchPrefix: "/company-builder" },
  { href: "/chat", label: "المساعد", icon: MessageSquareText, primary: true, matchPrefix: "/chat" },
  { href: "/ideas/analyze", label: "الأفكار", icon: Lightbulb, matchPrefix: "/ideas" },
  { href: "__menu__", label: "المزيد", icon: Menu },
];

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقل السفلي"
    >
      <div
        className="mx-2.5 mb-2.5 rounded-[28px] shadow-[0_-16px_48px_-8px_rgba(0,0,0,0.8)]"
        style={{
          background: "rgba(10,15,31,0.96)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        <ul className="grid grid-cols-5 items-end px-1 pt-2 pb-2">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const isMenu = it.href === "__menu__";
            const active =
              !isMenu &&
              (pathname === it.href ||
                (it.matchPrefix ? pathname.startsWith(it.matchPrefix) : false));

            const inner = (
              <div className="relative flex flex-col items-center justify-center py-1.5 px-1 gap-0.5">
                {it.primary ? (
                  <div className="-mt-7">
                    <div
                      className="relative w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-[0_8px_28px_-4px_rgba(79,70,229,0.7)]"
                      style={{
                        background: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 60%, #A855F7 100%)",
                        border: "1px solid rgba(255,255,255,0.18)",
                      }}
                    >
                      <span className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-xl" />
                      <Icon className="w-5 h-5 text-white relative z-10" />
                    </div>
                    <span className="block text-center text-[10px] mt-1.5 font-semibold text-white/55">
                      {it.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                        active ? "bg-brand-indigo/15 border border-brand-indigo/30" : "border border-transparent"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-[18px] h-[18px] transition-colors duration-200",
                          active ? "text-brand-cyan" : "text-white/28"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold transition-colors duration-200",
                        active ? "text-white/80" : "text-white/25"
                      )}
                    >
                      {it.label}
                    </span>
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          key="dot"
                          layoutId="bottomNavDot"
                          className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-cyan"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            );

            return (
              <li key={it.href}>
                {isMenu ? (
                  <button
                    onClick={onOpenMenu}
                    className="w-full active:scale-90 transition-transform"
                    aria-label="القائمة"
                  >
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={it.href}
                    className="block active:scale-90 transition-transform"
                    aria-label={it.label}
                  >
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

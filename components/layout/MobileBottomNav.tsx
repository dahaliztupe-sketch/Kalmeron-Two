"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard, MessageSquareText, Map, Compass, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
};

const ITEMS: Item[] = [
  { href: "/dashboard",     label: "الرئيسية", icon: LayoutDashboard },
  { href: "/roadmap",       label: "المخطط",   icon: Map },
  { href: "/chat",          label: "كلميرون",  icon: MessageSquareText, primary: true },
  { href: "/opportunities", label: "الفرص",    icon: Compass },
  { href: "__menu__",       label: "القائمة",  icon: Menu },
];

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none"
      aria-label="التنقل السفلي"
    >
      <div
        className={cn(
          "mx-3 mb-3 pointer-events-auto rounded-[28px]",
          // Premium triple-layer glass surface
          "border border-white/[0.10] bg-[linear-gradient(180deg,rgba(15,20,40,0.92)_0%,rgba(8,12,28,0.96)_100%)]",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_-15px_50px_-10px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.06),inset_0_-1px_0_rgb(0_0_0/0.30)]"
        )}
      >
        <ul className="grid grid-cols-5 items-end px-2 pt-2 pb-2">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const isMenu = it.href === "__menu__";
            const active = !isMenu && (pathname === it.href || pathname.startsWith(it.href + "/"));

            const inner = (
              <div className="relative flex flex-col items-center justify-center py-1.5 px-1">
                {it.primary ? (
                  <div className="relative -mt-8">
                    {/* Outer halo */}
                    <span className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 blur-lg opacity-70 animate-pulse" />
                    {/* Inner ring */}
                    <span className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 blur-sm opacity-90" />
                    {/* Core */}
                    <div className="relative w-[60px] h-[60px] rounded-full bg-[linear-gradient(135deg,#06B6D4_0%,#4F46E5_50%,#C026D3_100%)] flex items-center justify-center shadow-[0_12px_36px_-6px_rgb(79_70_229/0.7),inset_0_1.5px_0_rgb(255_255_255/0.30),inset_0_-1.5px_0_rgb(0_0_0/0.25)] border border-white/25">
                      <Icon className="w-[26px] h-[26px] text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.3)]" />
                    </div>
                    <span className="block text-center text-[10px] mt-1.5 font-bold tracking-wide text-white">
                      {it.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                        active
                          ? "bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/35 shadow-[0_4px_12px_-2px_rgb(56_189_248/0.4)]"
                          : "bg-transparent"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-[18px] h-[18px] transition-all duration-300",
                          active ? "text-cyan-300 scale-110" : "text-neutral-400"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] mt-0.5 font-semibold transition-colors",
                        active ? "text-white" : "text-neutral-500"
                      )}
                    >
                      {it.label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottomNavDot"
                        className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgb(56_189_248/0.7)]"
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
                  <button
                    onClick={onOpenMenu}
                    className="w-full active:scale-90 transition-transform duration-150"
                    aria-label={it.label}
                  >
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={it.href}
                    onClick={(e) => {
                      if (it.primary) {
                        e.preventDefault();
                        router.push(it.href);
                      }
                    }}
                    className="block active:scale-90 transition-transform duration-150"
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

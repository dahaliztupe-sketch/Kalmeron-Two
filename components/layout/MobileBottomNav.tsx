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
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/roadmap", label: "المخطط", icon: Map },
  { href: "/chat", label: "كلميرون", icon: MessageSquareText, primary: true },
  { href: "/opportunities", label: "الفرص", icon: Compass },
  { href: "__menu__", label: "القائمة", icon: Menu },
];

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none"
      aria-label="التنقل السفلي"
    >
      <div className="mx-3 mb-3 pointer-events-auto rounded-[28px] border border-white/10 bg-[#0B1020]/90 backdrop-blur-2xl shadow-[0_-15px_50px_-10px_rgba(0,0,0,0.7)]">
        <ul className="grid grid-cols-5 items-end px-2 pt-2 pb-2">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const isMenu = it.href === "__menu__";
            const active = !isMenu && (pathname === it.href || pathname.startsWith(it.href + "/"));

            const inner = (
              <div className="relative flex flex-col items-center justify-center py-1.5 px-1">
                {it.primary ? (
                  <div className="relative -mt-8">
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 blur-md opacity-70" />
                    <div className="relative w-[58px] h-[58px] rounded-full bg-gradient-to-br from-cyan-500 via-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(79,70,229,0.6)] border border-white/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="block text-center text-[10px] mt-1.5 font-semibold text-white">
                      {it.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-xl transition-all",
                        active
                          ? "bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30"
                          : "bg-transparent"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-[18px] h-[18px] transition-colors",
                          active ? "text-cyan-300" : "text-neutral-400"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] mt-0.5 font-semibold",
                        active ? "text-white" : "text-neutral-500"
                      )}
                    >
                      {it.label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottomNavDot"
                        className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-300"
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
                    className="w-full active:scale-95 transition-transform"
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
                    className="block active:scale-95 transition-transform"
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

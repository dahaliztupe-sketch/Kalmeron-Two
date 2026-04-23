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
  { href: "/chat", label: "المساعد", icon: MessageSquareText, primary: true },
  { href: "/opportunities", label: "الفرص", icon: Compass },
  { href: "__menu__", label: "القائمة", icon: Menu },
];

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقل السفلي"
    >
      <div className="mx-3 mb-3 rounded-3xl border border-white/10 bg-[#0B1020]/85 backdrop-blur-xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.6)]">
        <ul className="grid grid-cols-5 items-center px-1.5 py-1.5">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const isMenu = it.href === "__menu__";
            const active = !isMenu && (pathname === it.href || pathname.startsWith(it.href + "/"));

            const inner = (
              <div className="relative flex flex-col items-center justify-center py-2 px-1">
                {it.primary ? (
                  <div className="relative -mt-7">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 blur-md opacity-60" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 border border-white/15">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        active ? "text-indigo-300" : "text-neutral-400"
                      )}
                    />
                    {active && (
                      <motion.span
                        layoutId="bottomNavDot"
                        className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-indigo-300"
                      />
                    )}
                  </>
                )}
                {!it.primary && (
                  <span
                    className={cn(
                      "text-[10px] mt-1 font-medium",
                      active ? "text-white" : "text-neutral-500"
                    )}
                  >
                    {it.label}
                  </span>
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

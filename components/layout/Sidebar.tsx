"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import { Settings as SettingsIcon, LogOut, ChevronLeft, Sparkles } from "lucide-react";
import { NAV_SECTIONS, FOOTER_NAV, isActive, type NavItem } from "@/src/lib/navigation";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-6 pb-2.5 flex items-center gap-2">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span className="text-[9.5px] font-bold uppercase tracking-[0.28em] text-cyan-300/60">
        {children}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href, item.exact);

  return (
    <div className="relative">
      {active && (
        <motion.span
          layoutId="sidebarActiveBg"
          className="absolute inset-0 rounded-xl bg-gradient-to-l from-indigo-500/20 via-cyan-500/12 to-transparent border border-indigo-400/25 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Link
        href={item.href}
        prefetch
        className={cn(
          "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors duration-200",
          active ? "text-white" : "text-neutral-400 hover:text-white"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300",
            active
              ? "bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 text-white shadow-[0_6px_18px_-4px_rgb(79_70_229/0.7),inset_0_1px_0_rgb(255_255_255/0.25)]"
              : "bg-white/[0.04] text-neutral-400 group-hover:bg-white/[0.08] group-hover:text-cyan-300 group-hover:scale-105"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="truncate">{item.label}</span>
        {active && (
          <ChevronLeft className="ms-auto w-3.5 h-3.5 text-cyan-300/80 icon-flip" />
        )}
      </Link>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user, dbUser } = useAuth();

  return (
    <aside
      className={cn(
        "w-72 hidden md:flex flex-col h-screen fixed top-0 right-0 z-40",
        // Premium layered surface
        "bg-[linear-gradient(180deg,#080D1A_0%,#0B1020_50%,#070912_100%)]",
        "border-l border-white/[0.06]",
        "shadow-[inset_1px_0_0_rgb(255_255_255/0.03),0_0_60px_-20px_rgb(0_0_0/0.8)]",
        // Ambient glow accent at top
        "before:content-[''] before:absolute before:top-0 before:right-0 before:left-0 before:h-32 before:bg-[radial-gradient(ellipse_at_top,rgb(56_189_248/0.10),transparent_60%)] before:pointer-events-none"
      )}
    >
      {/* Brand area */}
      <div className="relative px-5 pt-5 pb-4 border-b border-white/[0.05]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500/50 via-indigo-500/40 to-fuchsia-500/40 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-11 h-11 rounded-2xl border border-white/10 bg-[#070A18]/80 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/brand/kalmeron-mark.svg"
                alt="Kalmeron AI"
                width={44}
                height={44}
                className="w-[78%] h-[78%] object-contain"
              />
            </div>
          </div>
          <div className="leading-none">
            <p className="font-display font-extrabold text-[1.05rem] tracking-tight text-white">
              KALMERON
            </p>
            <p className="text-[9.5px] uppercase tracking-[0.34em] text-cyan-300/70 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              AI Studio
            </p>
          </div>
        </Link>
      </div>

      {/* Mini profile chip — refined glass */}
      {user && (
        <div className="mx-3 mt-3 mb-1">
          <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] border border-white/[0.06] p-3 flex items-center gap-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
            <div className="relative shrink-0">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-70 blur-[2px]" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
              </div>
              <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B1020]" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[13px] font-bold text-white truncate">
                {dbUser?.name || user.displayName || "مؤسّس"}
              </p>
              <p className="text-[10px] text-cyan-300/70 uppercase tracking-[0.18em] truncate mt-0.5">
                {(dbUser as { industry?: string } | null | undefined)?.industry || "مؤسّس"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workspace switcher */}
      <div className="px-3 pt-3">
        <WorkspaceSwitcher />
      </div>

      {/* Nav — plain semantic <nav>; the previous Framer-motion stagger was
          delaying first paint of every link by 100-200ms on every render.   */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading}>
            <SectionHeading>{section.heading}</SectionHeading>
            <div className="space-y-0.5">
              {section.items.map((it) => (
                <NavLink key={it.href} item={it} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.05] space-y-0.5 bg-gradient-to-b from-transparent to-black/30">
        {FOOTER_NAV.map((it) => {
          const Icon = it.icon;
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200",
                active
                  ? "text-white bg-white/[0.06]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{it.label}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200",
            pathname.startsWith("/settings")
              ? "text-white bg-white/[0.06]"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          <span>الإعدادات</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

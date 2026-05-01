"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import { Settings as SettingsIcon, LogOut, Sparkles } from "lucide-react";
import { NAV_SECTIONS, isActive, type NavItem } from "@/src/lib/navigation";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/20 select-none">
      {children}
    </p>
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
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-indigo/25 via-brand-indigo/10 to-transparent border border-brand-indigo/30"
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
        />
      )}
      <Link
        href={item.href}
        prefetch
        className={cn(
          "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors duration-150",
          active
            ? "text-white"
            : "text-white/40 hover:text-white/80"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 shrink-0",
            active
              ? "bg-brand-indigo text-white shadow-[0_4px_16px_-2px_rgba(79,70,229,0.55)]"
              : "bg-white/[0.04] text-white/30 group-hover:bg-white/[0.08] group-hover:text-white/60"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="truncate flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-[9px] font-bold bg-brand-cyan/15 text-brand-cyan px-1.5 py-0.5 rounded-full border border-brand-cyan/25">
            {item.badge}
          </span>
        )}
      </Link>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user, dbUser } = useAuth();
  const firstName = (dbUser?.name || user?.displayName || "").split(" ")[0] || "مؤسّس";
  const initial = firstName.charAt(0);

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen fixed top-0 right-0 z-40 bg-[#07091A] border-l border-white/[0.05]">

      {/* Top glow */}
      <div className="absolute top-0 right-0 left-0 h-48 bg-gradient-to-b from-brand-indigo/8 to-transparent pointer-events-none" />

      {/* Brand */}
      <div className="relative px-5 pt-5 pb-4 border-b border-white/[0.05] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-xl bg-brand-indigo/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden">
              <Image
                alt="Kalmeron"
                src="/brand/kalmeron-mark.svg"
                width={36}
                height={36}
                className="w-[72%] h-[72%] object-contain"
                priority
              />
            </div>
          </div>
          <div className="leading-none min-w-0">
            <p className="font-display font-extrabold text-[1rem] tracking-tight text-white">
              KALMERON
            </p>
            <p className="text-[9px] uppercase tracking-[0.28em] text-brand-cyan/60 mt-1 flex items-center gap-1">
              <Sparkles className="w-2 h-2" />
              AI Studio
            </p>
          </div>
        </Link>
      </div>

      {/* User chip */}
      {user && (
        <div className="px-4 pt-3 pb-1 shrink-0">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all group"
          >
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet flex items-center justify-center text-white font-bold text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                {initial}
              </div>
              <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#07091A]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-white/90 truncate leading-tight">{firstName}</p>
              <p className="text-[9.5px] text-white/30 uppercase tracking-[0.15em] mt-0.5 truncate">
                {(dbUser as { industry?: string } | null)?.industry || "مؤسّس"}
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin mt-1" aria-label="القائمة الرئيسية">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading}>
            <SectionLabel>{section.heading}</SectionLabel>
            <div className="space-y-0.5">
              {section.items.map((it) => (
                <NavLink key={it.href} item={it} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.05] space-y-0.5 shrink-0">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150",
            pathname.startsWith("/settings")
              ? "text-white bg-white/[0.06]"
              : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
          )}
        >
          <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
          <span>الإعدادات</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/[0.06] transition-colors duration-150"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion, type Variants } from "motion/react";
import { Settings as SettingsIcon, LogOut, ChevronLeft } from "lucide-react";
import { NAV_SECTIONS, FOOTER_NAV, isActive, type NavItem } from "@/lib/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";

const containerV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, x: 14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/60">
      {children}
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href, item.exact);

  return (
    <motion.div variants={itemV} className="relative">
      {active && (
        <motion.span
          layoutId="sidebarActiveBg"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/15 via-cyan-500/10 to-fuchsia-500/10 border border-indigo-400/25"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Link
        href={item.href}
        className={cn(
          "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors duration-200",
          active
            ? "text-white"
            : "text-neutral-400 hover:text-white"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
            active
              ? "bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-[0_4px_12px_-2px_rgba(79,70,229,0.6)]"
              : "bg-white/[0.04] text-neutral-400 group-hover:bg-white/[0.08] group-hover:text-cyan-300"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="truncate">{item.label}</span>
        {active && (
          <ChevronLeft className="ml-auto w-3.5 h-3.5 text-cyan-300/80 icon-flip" />
        )}
      </Link>
    </motion.div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user, dbUser } = useAuth();

  return (
    <aside
      className={cn(
        "w-72 hidden md:flex flex-col h-screen fixed top-0 right-0 z-40 font-arabic",
        "bg-gradient-to-b from-[#080D1A] via-[#0B1020] to-[#070912]",
        "border-l border-white/[0.06]",
        "shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]"
      )}
    >
      {/* Brand area */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500/50 via-indigo-500/40 to-fuchsia-500/40 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-11 h-11 rounded-2xl border border-white/10 bg-[#070A18]/70 flex items-center justify-center">
              <img
                src="/brand/kalmeron-mark.svg"
                alt="Kalmeron AI"
                className="w-[78%] h-[78%] object-contain"
              />
            </div>
          </div>
          <div className="leading-none">
            <p className="font-display font-extrabold text-[1.05rem] tracking-tight text-white">
              KALMERON
            </p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-300/70 mt-1">
              AI Studio
            </p>
          </div>
        </Link>
      </div>

      {/* Mini profile chip */}
      {user && (
        <div className="mx-3 mt-3 mb-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-bold text-white truncate">
              {dbUser?.name || user.displayName || "Founder"}
            </p>
            <p className="text-[10px] text-cyan-300/70 uppercase tracking-wider truncate">
              {(dbUser as any)?.industry || "Founder"}
            </p>
          </div>
        </div>
      )}

      {/* Workspace switcher */}
      <div className="px-3 pt-3">
        <WorkspaceSwitcher />
      </div>

      {/* Nav */}
      <motion.nav
        variants={containerV}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-4"
      >
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
      </motion.nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.05] space-y-1">
        {FOOTER_NAV.map((it) => {
          const Icon = it.icon;
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all",
                active
                  ? "text-white bg-white/[0.05]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
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
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all",
            pathname.startsWith("/settings")
              ? "text-white bg-white/[0.05]"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
          )}
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          <span>الإعدادات</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

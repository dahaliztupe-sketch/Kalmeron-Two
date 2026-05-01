"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import { LogOut, Sparkles, ChevronRight } from "lucide-react";
import { NAV_SECTIONS, isActive, type NavItem } from "@/src/lib/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";

const BADGE_STYLES: Record<string, string> = {
  cyan:    "bg-cyan-400/10 text-cyan-300 border-cyan-400/25",
  amber:   "bg-amber-400/10 text-amber-300 border-amber-400/25",
  emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  violet:  "bg-violet-400/10 text-violet-300 border-violet-400/25",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-5 pb-2 text-[9.5px] font-bold uppercase tracking-[0.25em] text-white/15 select-none">
      {children}
    </p>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href, item.exact);
  const badgeStyle = BADGE_STYLES[item.badgeColor ?? "cyan"] ?? BADGE_STYLES.cyan;

  return (
    <div className="relative">
      {active && (
        <motion.span
          layoutId="sidebarActivePill"
          className="absolute inset-0 rounded-xl bg-gradient-to-l from-white/[0.06] via-brand-indigo/12 to-brand-indigo/8 border border-brand-indigo/20"
          transition={{ type: "spring", stiffness: 450, damping: 36 }}
        />
      )}
      <Link
        href={item.href}
        prefetch
        className={cn(
          "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
          active
            ? "text-white"
            : "text-white/35 hover:text-white/75 hover:bg-white/[0.03]"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center w-[28px] h-[28px] rounded-lg transition-all duration-200 shrink-0",
            active
              ? "bg-brand-indigo/80 text-white shadow-[0_0_16px_-2px_rgba(79,70,229,0.6)]"
              : "bg-white/[0.03] text-white/25 group-hover:bg-white/[0.06] group-hover:text-white/55"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>

        <span className="truncate flex-1 font-semibold">{item.label}</span>

        {item.badge && (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0",
            badgeStyle
          )}>
            {item.badge}
          </span>
        )}

        {active && (
          <ChevronRight className="w-3 h-3 text-white/30 shrink-0" />
        )}
      </Link>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user, dbUser } = useAuth();
  const displayName = dbUser?.name || user?.displayName || "";
  const firstName = displayName.split(" ")[0] || "مؤسّس";
  const initial = firstName.charAt(0).toUpperCase();
  const industry = (dbUser as { industry?: string } | null)?.industry;

  return (
    <aside
      className="w-64 hidden md:flex flex-col h-screen fixed top-0 right-0 z-40"
      style={{
        background: "linear-gradient(180deg, #080B1C 0%, #060818 100%)",
        borderLeft: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Top atmospheric glow */}
      <div className="absolute top-0 inset-x-0 h-64 pointer-events-none overflow-hidden rounded-t-none">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-indigo/8 blur-3xl" />
        <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full bg-brand-cyan/5 blur-3xl" />
      </div>

      {/* ── Brand header ── */}
      <div className="relative px-4 pt-5 pb-4 border-b border-white/[0.05] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/50 rounded-xl">
          <BrandLogo size={36} iconOnly showWordmark={false} />
          <div className="leading-none min-w-0">
            <p className="font-display font-black text-[15px] tracking-tight text-white group-hover:text-cyan-50 transition-colors">
              KALMERON
            </p>
            <p className="text-[9px] uppercase tracking-[0.3em] text-brand-cyan/50 mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2 h-2" />
              AI Studio
            </p>
          </div>
        </Link>
      </div>

      {/* ── User chip ── */}
      {user && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/50"
            style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[12px]"
                style={{
                  background: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px -2px rgba(79,70,229,0.5)",
                }}
              >
                {initial}
              </div>
              <span
                className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: "#10B981", borderColor: "#060818" }}
              />
            </div>

            {/* Name + role */}
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-white/90 truncate leading-tight">{firstName}</p>
              <p className="text-[9.5px] text-white/30 uppercase tracking-[0.18em] mt-0.5 truncate">
                {industry || "مؤسّس"}
              </p>
            </div>

            {/* Online indicator */}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          </Link>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto px-2 pb-3 mt-1 scrollbar-thin"
        aria-label="القائمة الرئيسية"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}
      >
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

      {/* ── Footer ── */}
      <div
        className="px-2 pb-4 pt-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-rose-400/50 hover:text-rose-300 hover:bg-rose-500/[0.07] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

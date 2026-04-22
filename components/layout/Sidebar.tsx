"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion, type Variants } from "motion/react";
import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { NAV_SECTIONS, FOOTER_NAV, isActive, type NavItem } from "@/lib/navigation";

const containerV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, x: 14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary/60">
      {children}
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href, item.exact);
  return (
    <motion.div variants={itemV}>
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
          active
            ? "bg-white/[0.06] text-white border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "text-text-secondary hover:text-white hover:bg-white/[0.03] border border-transparent"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-colors",
            active ? "text-brand-gold" : "text-text-secondary/70 group-hover:text-white"
          )}
        />
        <span className="truncate">{item.label}</span>
        {active && <span className="mr-auto w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />}
      </Link>
    </motion.div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen fixed top-0 right-0 z-40 backdrop-blur-xl bg-dark-surface/40 border-l border-white/10">
      <Link href="/dashboard" className="px-6 py-6 flex items-center justify-center border-b border-white/[0.05]">
        <img src="/brand/logo.svg" alt="Kalmeron Two" className="h-9 w-auto" />
      </Link>

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

      <div className="p-3 border-t border-white/[0.05] space-y-1">
        {FOOTER_NAV.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                isActive(pathname, it.href)
                  ? "text-brand-gold bg-white/[0.04]"
                  : "text-text-secondary hover:text-white hover:bg-white/[0.03]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{it.label}</span>
            </Link>
          );
        })}
        <Link
          href="/profile?tab=settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-white hover:bg-white/[0.03] transition-all"
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          <span>الإعدادات</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

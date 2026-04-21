"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion, type Variants } from "framer-motion";
import {
  LayoutDashboard, MessageSquareText, Map, Megaphone, TrendingUp,
  Settings as SettingsIcon, Wallet, Users as UsersIcon, Heart, Scale,
  FlaskConical, Trophy, ShieldAlert, Radar, LogOut,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: any; exact?: boolean };

const sectionMain: NavItem[] = [
  { href: "/dashboard", label: "مركز القيادة", icon: LayoutDashboard, exact: true },
  { href: "/chat", label: "المساعد", icon: MessageSquareText },
  { href: "/roadmap", label: "المخطط", icon: Map },
];

const sectionDepartments: NavItem[] = [
  { href: "/departments/marketing", label: "التسويق", icon: Megaphone },
  { href: "/departments/sales", label: "المبيعات", icon: TrendingUp },
  { href: "/departments/operations", label: "العمليات", icon: SettingsIcon },
  { href: "/departments/finance", label: "المالية", icon: Wallet },
  { href: "/departments/hr", label: "الموارد البشرية", icon: UsersIcon },
  { href: "/departments/support", label: "خدمة العملاء", icon: Heart },
  { href: "/departments/legal", label: "القانونية", icon: Scale },
];

const sectionTools: NavItem[] = [
  { href: "/market-lab", label: "مختبر السوق", icon: FlaskConical },
  { href: "/success-museum", label: "متحف النجاح", icon: Trophy },
  { href: "/mistake-shield", label: "حارس الأخطاء", icon: ShieldAlert },
  { href: "/opportunities", label: "رادار الفرص", icon: Radar },
];

const containerV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, x: 14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

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
      {/* Brand */}
      <Link href="/dashboard" className="px-6 py-6 flex items-center justify-center border-b border-white/[0.05]">
        <img src="/brand/logo.svg" alt="Kalmeron Two" className="h-9 w-auto" />
      </Link>

      {/* Nav */}
      <motion.nav
        variants={containerV}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-4"
      >
        <SectionHeading>الرئيسي</SectionHeading>
        <div className="space-y-0.5">
          {sectionMain.map((it) => <NavLink key={it.href} item={it} pathname={pathname} />)}
        </div>

        <SectionHeading>الأقسام السبعة</SectionHeading>
        <div className="space-y-0.5">
          {sectionDepartments.map((it) => <NavLink key={it.href} item={it} pathname={pathname} />)}
        </div>

        <SectionHeading>الأدوات</SectionHeading>
        <div className="space-y-0.5">
          {sectionTools.map((it) => <NavLink key={it.href} item={it} pathname={pathname} />)}
        </div>
      </motion.nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-white/[0.05] space-y-1">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
            isActive(pathname, '/profile')
              ? "text-brand-gold bg-white/[0.04]"
              : "text-text-secondary hover:text-white hover:bg-white/[0.03]"
          )}
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

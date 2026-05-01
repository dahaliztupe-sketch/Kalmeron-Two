import type React from "react";
import {
  LayoutDashboard,
  MessageSquareText,
  Inbox,
  Building2,
  ScrollText,
  FlaskConical,
  Sparkles,
  User as UserIcon,
  LineChart,
  Radar,
  Settings,
  Zap,
  Target,
  Users,
  Brain,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  exact?: boolean;
  badge?: string;
  badgeColor?: "cyan" | "amber" | "emerald" | "violet";
};

export type NavSection = {
  heading: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "الرئيسي",
    items: [
      { href: "/dashboard", label: "لوحة القيادة", icon: LayoutDashboard, exact: true },
      { href: "/chat", label: "المساعد الذكي", icon: MessageSquareText, badge: "AI", badgeColor: "cyan" },
      { href: "/inbox", label: "الموافقات", icon: Inbox },
    ],
  },
  {
    heading: "شركتي",
    items: [
      { href: "/company-builder", label: "بناء الشركة", icon: Building2 },
      { href: "/departments", label: "الأقسام", icon: Users },
      { href: "/plan", label: "الأهداف والخطة", icon: Target },
      { href: "/investor", label: "لوحة المستثمر", icon: LineChart },
    ],
  },
  {
    heading: "الأدوات",
    items: [
      { href: "/ideas/analyze", label: "مختبر الأفكار", icon: Brain, badge: "جديد", badgeColor: "emerald" },
      { href: "/opportunities", label: "رادار الفرص", icon: Radar },
      { href: "/lab", label: "أدوات الأعمال", icon: FlaskConical },
      { href: "/brand-voice", label: "صوت العلامة", icon: Sparkles },
    ],
  },
  {
    heading: "الحساب",
    items: [
      { href: "/profile", label: "الملف الشخصي", icon: UserIcon },
      { href: "/settings", label: "الإعدادات", icon: Settings },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const FOOTER_NAV: NavItem[] = [];

export function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

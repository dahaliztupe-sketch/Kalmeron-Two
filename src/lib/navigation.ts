import type React from "react";
import {
  LayoutDashboard, MessageSquareText, Inbox,
  Building2, ScrollText,
  FlaskConical, Sparkles, User as UserIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  exact?: boolean;
  badge?: string;
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
      { href: "/chat", label: "المساعد الذكي", icon: MessageSquareText },
      { href: "/inbox", label: "صندوق الموافقات", icon: Inbox },
    ],
  },
  {
    heading: "شركتي",
    items: [
      { href: "/departments", label: "الأقسام", icon: Building2 },
      { href: "/plan", label: "الخطة والأهداف", icon: ScrollText },
    ],
  },
  {
    heading: "أدوات",
    items: [
      { href: "/lab", label: "مختبر الأعمال", icon: FlaskConical },
    ],
  },
  {
    heading: "الحساب",
    items: [
      { href: "/investor", label: "لوحة المستثمر", icon: Sparkles },
      { href: "/profile", label: "الملف الشخصي", icon: UserIcon },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const FOOTER_NAV: NavItem[] = [];

export function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

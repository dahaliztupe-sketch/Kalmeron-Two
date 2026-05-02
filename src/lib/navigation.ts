import type React from "react";
import {
  LayoutDashboard,
  MessageSquareText,
  Inbox,
  Building2,
  FlaskConical,
  Sparkles,
  User as UserIcon,
  LineChart,
  Radar,
  Settings,
  Target,
  Users,
  Brain,
  BookOpen,
  Sun,
  BarChart3,
  Workflow,
  Activity,
  Bell,
  Rocket,
  Calculator,
  Heart,
  TrendingUp,
  Flame,
  Server,
  PieChart,
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
      { href: "/daily-brief", label: "إيجاز الصباح", icon: Sun },
      { href: "/inbox", label: "الموافقات", icon: Inbox },
    ],
  },
  {
    heading: "شركتي",
    items: [
      { href: "/company-builder", label: "بناء الشركة", icon: Building2 },
      { href: "/departments", label: "الأقسام", icon: Users },
      { href: "/launchpad", label: "منصة الإطلاق", icon: Rocket, badge: "جديد", badgeColor: "violet" },
      { href: "/plan", label: "الأهداف والخطة", icon: Target },
      { href: "/cash-runway", label: "المدرج المالي", icon: Calculator },
      { href: "/investor", label: "لوحة المستثمر", icon: LineChart },
    ],
  },
  {
    heading: "الأدوات",
    items: [
      { href: "/ideas/analyze", label: "مختبر الأفكار", icon: Brain, badge: "AI", badgeColor: "emerald" },
      { href: "/opportunities", label: "رادار الفرص", icon: Radar },
      { href: "/market-lab", label: "مختبر السوق", icon: FlaskConical },
      { href: "/brand-voice", label: "صوت العلامة", icon: Sparkles },
      { href: "/decision-journal", label: "دفتر القرارات", icon: BookOpen },
      { href: "/okr", label: "أهداف OKR", icon: BarChart3 },
      { href: "/workflows-runner", label: "المسارات الآلية", icon: Workflow },
      { href: "/operations", label: "غرفة العمليات", icon: Activity },
      { href: "/trending-tools", label: "أدوات AI الرائجة", icon: Flame },
    ],
  },
  {
    heading: "الحساب",
    items: [
      { href: "/profile", label: "الملف الشخصي", icon: UserIcon },
      { href: "/notifications", label: "الإشعارات", icon: Bell },
      { href: "/usage", label: "الاستخدام", icon: PieChart },
      { href: "/wellbeing", label: "صحتك النفسية", icon: Heart },
      { href: "/settings", label: "الإعدادات", icon: Settings },
    ],
  },
  {
    heading: "النظام",
    items: [
      { href: "/system-health", label: "صحة النظام", icon: Server },
      { href: "/investor", label: "مقاييس المستثمر", icon: TrendingUp },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const FOOTER_NAV: NavItem[] = [];

export function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

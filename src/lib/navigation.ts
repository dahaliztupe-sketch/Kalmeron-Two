import type React from "react";
import {
  LayoutDashboard, MessageSquareText, Map, Megaphone, TrendingUp,
  Settings as SettingsIcon, Wallet, Users as UsersIcon, Heart, Scale,
  FlaskConical, Trophy, ShieldAlert, Radar, FileText,
  Building2, ScrollText, Lightbulb, Store, User as UserIcon,
  Target, Brain, CreditCard, Inbox as InboxIcon, Sparkles, Cpu,
  BarChart3, Calculator, LayoutTemplate, Layers, Mic, Eye, ShieldCheck, BookOpen,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  exact?: boolean;
};

export type NavSection = {
  heading: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "الرئيسي",
    items: [
      { href: "/dashboard", label: "مركز القيادة", icon: LayoutDashboard, exact: true },
      { href: "/chat", label: "المساعد", icon: MessageSquareText },
      { href: "/okr", label: "أهداف الأسبوع", icon: Target },
      { href: "/brain", label: "الدماغ المشترك", icon: Brain },
      { href: "/learned-skills", label: "المهارات المُتعلَّمة", icon: Sparkles },
      { href: "/roadmap", label: "المخطط", icon: Map },
      { href: "/plan", label: "خطة العمل", icon: ScrollText },
      { href: "/ideas/analyze", label: "تحليل الأفكار", icon: Lightbulb },
      { href: "/inbox", label: "صندوق الموافقات", icon: InboxIcon },
    ],
  },
  {
    heading: "الأقسام السبعة",
    items: [
      { href: "/departments/marketing", label: "التسويق", icon: Megaphone },
      { href: "/departments/sales", label: "المبيعات", icon: TrendingUp },
      { href: "/departments/operations", label: "العمليات", icon: SettingsIcon },
      { href: "/departments/finance", label: "المالية", icon: Wallet },
      { href: "/departments/hr", label: "الموارد البشرية", icon: UsersIcon },
      { href: "/departments/support", label: "خدمة العملاء", icon: Heart },
      { href: "/departments/legal", label: "القانونية", icon: Scale },
    ],
  },
  {
    heading: "إعدادات العلامة التجارية",
    items: [
      { href: "/brand-voice", label: "صوت العلامة التجارية", icon: Mic },
    ],
  },
  {
    heading: "للمستثمرين",
    items: [
      { href: "/investor", label: "نبضة المنصّة", icon: Sparkles, exact: true },
      { href: "/investor/health", label: "فحص جاهزية العرض", icon: ShieldCheck },
      { href: "/investor/demo-mode", label: "وضع العرض", icon: Eye },
      { href: "/investor/guide", label: "دليل المتحدّث", icon: BookOpen },
    ],
  },
  {
    heading: "الأدوات الإستراتيجية",
    items: [
      { href: "/agents", label: "عرض الوكلاء", icon: Cpu },
      { href: "/templates", label: "مكتبة القوالب", icon: LayoutTemplate },
      { href: "/trending-tools", label: "أدوات AI الرائجة", icon: Layers },
      { href: "/market-lab", label: "مختبر السوق", icon: FlaskConical },
      { href: "/opportunities", label: "رادار الفرص", icon: Radar },
      { href: "/cfo", label: "المدير المالي", icon: BarChart3 },
      { href: "/roi", label: "حاسبة ROI", icon: Calculator },
      { href: "/success-museum", label: "متحف النجاح", icon: Trophy },
      { href: "/mistake-shield", label: "درع الأخطاء", icon: ShieldAlert },
      { href: "/real-estate", label: "العقارات", icon: Building2 },
      { href: "/legal-templates", label: "نماذج قانونية", icon: FileText },
      { href: "/marketplace", label: "السوق", icon: Store },
      { href: "/pricing", label: "الخطط والأسعار", icon: CreditCard },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const FOOTER_NAV: NavItem[] = [
  { href: "/profile", label: "حسابي", icon: UserIcon },
];

export function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

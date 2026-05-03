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
  Scale,
  UserCheck,
  LayoutTemplate,
  MapPin,
  Mic,
  Globe,
  Home,
  Package,
  ShoppingCart,
  Network,
  Video,
  CalendarDays,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  exact?: boolean;
  badge?: string;
  badgeColor?: "cyan" | "amber" | "emerald" | "violet" | "rose";
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
      { href: "/weekly-report", label: "التقرير الأسبوعي", icon: CalendarDays, badge: "جديد", badgeColor: "violet" },
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
      { href: "/meetings", label: "اجتماعات الفريق", icon: Video },
    ],
  },
  {
    heading: "الأدوات",
    items: [
      { href: "/ideas/analyze", label: "مختبر الأفكار", icon: Brain, badge: "AI", badgeColor: "emerald" },
      { href: "/ideas/canvas", label: "كانفاس الأعمال", icon: LayoutTemplate, badge: "جديد", badgeColor: "violet" },
      { href: "/customer-discovery", label: "اكتشاف العملاء", icon: Users, badge: "جديد", badgeColor: "cyan" },
      { href: "/competitor-watch", label: "رصد المنافسين", icon: Radar, badge: "جديد", badgeColor: "rose" },
      { href: "/pitch-practice", label: "تدريب الـ Pitch", icon: Mic, badge: "جديد", badgeColor: "violet" },
      { href: "/opportunities", label: "رادار الفرص", icon: Radar },
      { href: "/market-lab", label: "مختبر السوق", icon: FlaskConical },
      { href: "/market-intelligence", label: "استخبارات السوق", icon: Globe, badge: "جديد", badgeColor: "cyan" },
      { href: "/brand-voice", label: "صوت العلامة", icon: Sparkles },
      { href: "/contract-review", label: "مراجع العقود", icon: Scale, badge: "جديد", badgeColor: "amber" },
      { href: "/legal-ai", label: "المستشار القانوني", icon: Scale },
      { href: "/setup-egypt", label: "التأسيس في مصر", icon: MapPin },
      { href: "/egypt-calc", label: "الحاسبة المصرية", icon: Calculator, badge: "جديد", badgeColor: "emerald" },
      { href: "/real-estate", label: "تحليل العقارات", icon: Home },
      { href: "/decision-journal", label: "دفتر القرارات", icon: BookOpen },
      { href: "/smart-pricing", label: "التسعير الذكي", icon: BarChart3, badge: "جديد", badgeColor: "emerald" },
      { href: "/financial-model", label: "النموذج المالي", icon: BarChart3, badge: "جديد", badgeColor: "cyan" },
      { href: "/growth-lab", label: "مختبر النمو", icon: Rocket, badge: "جديد", badgeColor: "violet" },
      { href: "/supply-chain", label: "سلسلة التوريد", icon: Package },
      { href: "/hr-ai", label: "مساعد الموارد البشرية", icon: Users, badge: "جديد", badgeColor: "amber" },
      { href: "/email-ai", label: "كاتب البريد الذكي", icon: MessageSquareText, badge: "جديد", badgeColor: "violet" },
      { href: "/sales-coach", label: "مدرّب المبيعات", icon: TrendingUp, badge: "جديد", badgeColor: "emerald" },
      { href: "/sales", label: "التسويق والمبيعات", icon: ShoppingCart },
      { href: "/okr", label: "أهداف OKR", icon: BarChart3 },
      { href: "/workflows-runner", label: "المسارات الآلية", icon: Workflow },
      { href: "/operations", label: "غرفة العمليات", icon: Activity },
      { href: "/brain", label: "رسم المعرفة", icon: Network },
      { href: "/trending-tools", label: "أدوات AI الرائجة", icon: Flame },
    ],
  },
  {
    heading: "الفريق",
    items: [
      { href: "/org-chart", label: "الهيكل التنظيمي", icon: Network },
      { href: "/hr", label: "مساعد التوظيف", icon: Users },
      { href: "/experts", label: "المستشارون الذكيون", icon: Brain },
      { href: "/cofounder-health", label: "صحة فريق المؤسسين", icon: UserCheck, badge: "جديد", badgeColor: "violet" },
      { href: "/wellbeing", label: "صحتك النفسية", icon: Heart },
      { href: "/founder-agreement", label: "معالج اتفاقية المؤسسين", icon: Scale, badge: "جديد", badgeColor: "emerald" },
    ],
  },
  {
    heading: "الحساب",
    items: [
      { href: "/profile", label: "الملف الشخصي", icon: UserIcon },
      { href: "/notifications", label: "الإشعارات", icon: Bell },
      { href: "/usage", label: "الاستخدام", icon: PieChart },
      { href: "/settings", label: "الإعدادات", icon: Settings },
    ],
  },
  {
    heading: "النظام",
    items: [
      { href: "/system-health", label: "صحة النظام", icon: Server },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const FOOTER_NAV: NavItem[] = [];

export function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

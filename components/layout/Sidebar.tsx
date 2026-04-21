"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard, MessageSquareText, Lightbulb, Target,
  ShieldAlert, FileText, Trophy, Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/chat", label: "مستشار كلميرون", icon: MessageSquareText },
  { href: "/ideas/analyze", label: "تحليل الفكرة", icon: Lightbulb },
  { href: "/plan", label: "خطة العمل", icon: FileText },
  { href: "/opportunities", label: "رادار الفرص", icon: Target },
  { href: "/mistake-shield", label: "حارس الأخطاء", icon: ShieldAlert },
  { href: "/success-museum", label: "متحف النجاح", icon: Trophy },
  { href: "/market-lab", label: "مختبر السوق", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="w-64 bg-[#0A0A0F]/95 backdrop-blur-xl border-l border-white/[0.05] flex flex-col h-screen fixed top-0 right-0 z-40 hidden md:flex">
      <div className="p-8 flex justify-center border-b border-white/[0.03]">
        <Image
          src="/logo.jpg"
          alt="Kalmeron Two"
          width={160}
          height={40}
          className="w-auto h-auto transition-all hover:scale-[1.02]"
          priority
        />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group",
                active
                  ? "bg-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.06]"
                  : "text-neutral-500 hover:text-white hover:bg-white/[0.03]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors duration-200 shrink-0",
                  active ? "text-[rgb(var(--gold))]" : "text-neutral-600 group-hover:text-neutral-400"
                )}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--gold))] shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-900/60">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-semibold",
            isActive('/profile')
              ? "text-[rgb(var(--gold))] bg-white/[0.04]"
              : "text-neutral-500 hover:text-white hover:bg-white/[0.02]"
          )}
        >
          <div className="w-4 h-4 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span>الإعدادات</span>
        </Link>
      </div>
    </div>
  );
}

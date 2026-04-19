"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { LayoutDashboard, MessageSquareText, Lightbulb, Target, ShieldAlert, Sparkles, Settings, FileText } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/chat", label: "مستشار كلميرون", icon: MessageSquareText },
  { href: "/ideas/analyze", label: "تحليل الفكرة", icon: Lightbulb },
  { href: "/plan", label: "خطة العمل", icon: FileText },
  { href: "/opportunities", label: "رادار الفرص", icon: Target },
  { href: "/mistake-shield", label: "حارس الأخطاء", icon: ShieldAlert },
  { href: "/success-museum", label: "متحف النجاح", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#0A0A0F]/95 backdrop-blur-xl border-l border-white/[0.05] flex flex-col h-screen fixed top-0 right-0 z-40 hidden md:flex">
      <div className="p-10 flex justify-center">
          <Image src="/brand/logo.svg" alt="Kalmeron Two" width={160} height={40} className="w-auto h-auto transition-all hover:scale-[1.02]" />
      </div>
      <nav className="flex-1 px-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm",
                isActive 
                  ? "bg-white/[0.04] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.05]" 
                  : "text-neutral-500 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-colors duration-300", isActive ? "text-[rgb(var(--gold))]" : "text-neutral-600")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <Link href="/profile" className="flex items-center gap-3 p-3 text-neutral-400">
          <Settings className="w-5 h-5" />
          <span>الإعدادات</span>
        </Link>
      </div>
    </div>
  );
}

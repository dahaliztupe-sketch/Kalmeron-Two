"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Globe, X, LogOut, LayoutDashboard, MessageSquareText,
  Lightbulb, Target, ShieldAlert, Network, FileText, User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import Loading from "@/app/loading";
import Image from "next/image";

const ALL_NAV_ITEMS = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/chat", label: "مستشار كلميرون", icon: MessageSquareText },
  { href: "/ideas/analyze", label: "تحليل الفكرة", icon: Lightbulb },
  { href: "/plan", label: "خطة العمل", icon: FileText },
  { href: "/opportunities", label: "رادار الفرص", icon: Target },
  { href: "/mistake-shield", label: "حارس الأخطاء", icon: ShieldAlert },
  { href: "/p3-hub", label: "مراقبة الوكلاء", icon: Network },
  { href: "/profile", label: "الملف الشخصي", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, dbUser, loading, signInWithGoogle, signOut: logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dir = language === "ar" ? "rtl" : "ltr";

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div className="flex min-h-screen bg-[#06060A] flex-col items-center justify-center text-white relative overflow-hidden" dir={dir}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(244,180,26,0.08),transparent_70%)]"></div>
        <div className="z-10 text-center max-w-2xl px-8 space-y-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "circOut" }}>
            <div className="flex justify-center mb-12">
              <Image src="/logo.jpg" alt="Kalmeron AI Logo" width={120} height={120} className="h-24 w-24 rounded-2xl shadow-[0_0_40px_rgba(138,43,226,0.5)]" priority />
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white leading-none">
              {language === 'ar' ? 'اصنع عظمة.' : 'Create Greatness.'}
            </h2>
            <p className="text-xl text-neutral-500 font-medium max-w-lg mx-auto leading-relaxed">
              {language === 'ar'
                ? 'المنصة الاستراتيجية لرواد الأعمال الطموحين في مصر.'
                : 'The strategic platform for ambitious Egyptian entrepreneurs.'}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
            <Link href="/auth/signup">
              <Button
                className="h-16 px-12 rounded-full text-xl bg-white text-black hover:bg-neutral-200 font-bold transition-all hover:scale-105 active:scale-95"
              >
                {language === 'ar' ? 'بدء الرحلة' : 'Enter the Future'}
              </Button>
            </Link>
          </motion.div>

          <Button
            variant="ghost"
            className="text-neutral-500 hover:text-white mt-8"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          >
            <Globe className="h-4 w-4 mr-2" />
            {language === "en" ? "تبديل للغة العربية" : "Switch to English"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#06060A] overflow-hidden" dir={dir}>
      <Sidebar />

      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300",
        language === 'ar' ? "mr-0 md:mr-64" : "ml-0 md:ml-64"
      )}>
        {/* Header */}
        <header className="h-20 border-b border-neutral-900 bg-[#0A0A0F]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-neutral-400 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="فتح القائمة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <Image src="/logo.jpg" alt="Logo" width={140} height={35} className="md:hidden" style={{ height: '2rem', width: 'auto' }} />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-[rgb(var(--gold))]"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              aria-label="تبديل اللغة"
            >
              <Globe className="h-5 w-5" />
            </Button>

            <div className="h-8 w-[1px] bg-neutral-800 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className={cn("text-right hidden sm:block", dir === 'ltr' && "text-left")}>
                <p className="text-sm font-bold text-white leading-tight">{dbUser?.name || user.displayName}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{(dbUser as any)?.industry || "Entrepreneur"}</p>
              </div>
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold cursor-pointer hover:border-[rgb(var(--gold))] transition-all active:scale-90">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="min-h-[calc(100vh-80px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-4 md:p-8"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: dir === 'rtl' ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "absolute top-0 bottom-0 w-72 bg-[#0A0A0F] shadow-2xl flex flex-col",
                dir === 'rtl' ? "right-0" : "left-0"
              )}
            >
              <div className="flex justify-between items-center p-6 border-b border-neutral-900">
                <Image src="/logo.jpg" alt="Logo" width={140} height={35} style={{ height: '2rem', width: 'auto' }} />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="إغلاق">
                  <X className="h-6 w-6 text-white" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {ALL_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm",
                        isActive
                          ? "bg-white/[0.04] text-white border border-white/[0.05]"
                          : "text-neutral-500 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-[rgb(var(--gold))]" : "text-neutral-600")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-neutral-900">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="h-5 w-5 mr-3" /> تسجيل الخروج
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

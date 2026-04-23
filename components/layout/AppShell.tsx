"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, X, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { CreditsIndicator } from "./CreditsIndicator";
import { MobileBottomNav } from "./MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import Loading from "@/app/loading";
import { NAV_SECTIONS } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, dbUser, loading, signOut: logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dir = language === "ar" ? "rtl" : "ltr";

  if (loading) return <Loading />;

  // ───── Logged-out splash ─────
  if (!user) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-[#070912]" dir={dir}>
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-indigo-600/25 blur-[140px]" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[140px]" />
        </div>
        <div className="z-10 text-center max-w-2xl px-6 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <BrandLogo size={88} showWordmark={false} href={null} className="mx-auto mb-8" glow />
            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight bg-gradient-to-br from-white via-indigo-200 to-blue-300 bg-clip-text text-transparent">
              {language === "ar" ? "نظام تشغيل رواد الأعمال" : "The Operating System for Founders"}
            </h2>
            <p className="text-base md:text-lg text-neutral-400 max-w-lg mx-auto leading-relaxed">
              {language === "ar"
                ? "7 أقسام و+50 وكيلاً ذكياً يعملون كفريقك المؤسس."
                : "7 departments and 50+ AI agents working as your founding team."}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup">
              <Button className="h-14 px-10 rounded-full text-base bg-white text-black hover:bg-neutral-200 font-bold w-full sm:w-auto">
                {language === "ar" ? "ابدأ مجاناً" : "Start Free"}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="h-14 px-8 rounded-full text-base border border-white/15 text-white hover:bg-white/5 w-full sm:w-auto">
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Button>
            </Link>
          </motion.div>

          <Button
            variant="ghost"
            className="text-neutral-400 hover:text-white"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          >
            <Globe className="h-4 w-4 mr-2" />
            {language === "en" ? "تبديل للعربية" : "Switch to English"}
          </Button>
        </div>
      </div>
    );
  }

  // ───── Logged-in shell ─────
  return (
    <div className="flex min-h-screen bg-[#070912] overflow-hidden" dir={dir}>
      <Sidebar />

      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen w-full transition-all duration-300",
          dir === "rtl" ? "md:mr-64" : "md:ml-64"
        )}
      >
        {/* Header */}
        <header className="h-16 border-b border-white/[0.05] bg-[#0B1020]/60 backdrop-blur-xl flex items-center justify-between px-3 md:px-8 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <BrandLogo size={32} showWordmark={false} href="/dashboard" glow />
            </div>
            <div className="md:hidden leading-tight">
              <p className="text-[11px] text-neutral-400">مرحباً</p>
              <p className="text-sm font-bold text-white truncate max-w-[140px]">
                {dbUser?.name || user.displayName || "صديقي"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-indigo-300 h-9 w-9"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              aria-label="تبديل اللغة"
            >
              <Globe className="h-4.5 w-4.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-indigo-300 h-9 w-9 hidden sm:flex"
              aria-label="الإشعارات"
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>

            <div className="hidden sm:block">
              <CreditsIndicator />
            </div>

            <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

            <Link href="/profile" className="hidden md:flex items-center gap-3">
              <div className={cn("text-right hidden lg:block", dir === "ltr" && "text-left")}>
                <p className="text-sm font-bold text-white leading-tight">{dbUser?.name || user.displayName}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{(dbUser as any)?.industry || "Founder"}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 border border-white/15 flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform">
                {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
              </div>
            </Link>

            <Link href="/profile" className="md:hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm border border-white/15">
                {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

      {/* Mobile full menu (sections) */}
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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute bottom-0 inset-x-0 max-h-[85vh] bg-[#0B1020] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col"
            >
              <div className="flex justify-center pt-3">
                <div className="w-12 h-1 rounded-full bg-white/15" />
              </div>
              <div className="flex justify-between items-center px-5 py-4">
                <BrandLogo size={32} />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="إغلاق">
                  <X className="h-5 w-5 text-white" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.heading} className="mb-4">
                    <div className="px-4 pt-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                      {section.heading}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-3 rounded-2xl transition-all text-sm border",
                              isActive
                                ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                                : "bg-white/[0.02] border-white/5 text-neutral-300 active:scale-95"
                            )}
                          >
                            <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-300" : "text-neutral-500")} />
                            <span className="truncate font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-3 border-t border-white/[0.06] pb-[calc(env(safe-area-inset-bottom)+12px)]">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-xl"
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

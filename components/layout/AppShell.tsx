"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, X, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import Loading from "@/app/loading";
import { FLAT_NAV as ALL_NAV } from "@/lib/navigation";
import dynamic from "next/dynamic";

const Logo3D = dynamic(() => import("@/components/3d/Logo3D"), { ssr: false });

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, dbUser, loading, signOut: logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dir = language === "ar" ? "rtl" : "ltr";

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-dark-bg aurora-bg" dir={dir}>
        <div className="z-10 text-center max-w-2xl px-8 space-y-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "circOut" }}>
            <div className="flex justify-center mb-10">
              <img src="/brand/logo.svg" alt="Kalmeron Two" className="h-16 w-auto" />
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 brand-gradient-text leading-tight">
              {language === 'ar' ? 'نظام تشغيل رواد الأعمال' : 'The Operating System for Founders'}
            </h2>
            <p className="text-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
              {language === 'ar'
                ? '7 أقسام و50+ وكيلاً ذكياً يعملون كفريقك المؤسس.'
                : '7 departments and 50+ AI agents working as your founding team.'}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
            <Link href="/auth/signup">
              <Button className="h-14 px-10 rounded-full text-lg bg-white text-black hover:bg-neutral-200 font-bold transition-all hover:scale-105 active:scale-95">
                {language === 'ar' ? 'جرب كلميرون مجاناً' : 'Try Kalmeron Free'}
              </Button>
            </Link>
          </motion.div>

          <Button
            variant="ghost"
            className="text-text-secondary hover:text-white"
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
    <div className="flex h-screen bg-dark-bg overflow-hidden" dir={dir}>
      <Sidebar />

      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300",
        language === 'ar' ? "mr-0 md:mr-64" : "ml-0 md:ml-64"
      )}>
        {/* Header */}
        <header className="h-16 border-b border-white/[0.05] bg-dark-surface/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-text-secondary hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="فتح القائمة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <div className="md:hidden">
              <Logo3D size={40} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:text-brand-gold"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              aria-label="تبديل اللغة"
            >
              <Globe className="h-5 w-5" />
            </Button>

            <div className="h-8 w-[1px] bg-white/[0.07] mx-1 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className={cn("text-right hidden sm:block", dir === 'ltr' && "text-left")}>
                <p className="text-sm font-bold text-white leading-tight">{dbUser?.name || user.displayName}</p>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">{(dbUser as any)?.industry || "Founder"}</p>
              </div>
              <Link href="/profile">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold cursor-pointer hover:border-brand-gold transition-all active:scale-90">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="min-h-[calc(100vh-64px)]">
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
                "absolute top-0 bottom-0 w-72 bg-dark-surface shadow-2xl flex flex-col border-l border-white/10",
                dir === 'rtl' ? "right-0" : "left-0"
              )}
            >
              <div className="flex justify-between items-center p-5 border-b border-white/[0.06]">
                <img src="/brand/logo.svg" alt="Logo" className="h-7 w-auto" />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="إغلاق">
                  <X className="h-5 w-5 text-white" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-hide">
                {ALL_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm",
                        isActive
                          ? "bg-white/[0.06] text-white border border-white/[0.07]"
                          : "text-text-secondary hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-brand-gold" : "text-text-secondary/70")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-white/[0.06]">
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

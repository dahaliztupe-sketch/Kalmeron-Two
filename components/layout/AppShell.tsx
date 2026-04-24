"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, X, LogOut, Search, Sparkles } from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { CreditsIndicator } from "./CreditsIndicator";
import { MobileBottomNav } from "./MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AnimatedBrandMark } from "@/components/brand/AnimatedBrandMark";
import Loading from "@/app/loading";
import { NAV_SECTIONS } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, dbUser, loading, signOut: logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dir = language === "ar" ? "rtl" : "ltr";

  if (loading) return <Loading />;

  // ───────────── Logged-out splash (premium) ─────────────
  if (!user) {
    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden mesh-gradient aurora-bg starfield"
        dir={dir}
      >
        {/* Subtle grid overlay for depth */}
        <div className="absolute inset-0 grid-overlay pointer-events-none opacity-40" />

        <div className="z-10 text-center max-w-2xl px-6 space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40 blur-3xl logo-halo" />
              <div className="relative w-full h-full rounded-3xl border border-white/10 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.1)] bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center overflow-hidden">
                <AnimatedBrandMark size={120} halo={false} glow />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200 mb-6"
            >
              <span className="live-dot" />
              <Sparkles className="w-3 h-3" />
              <span>{language === "ar" ? "مقرّ عمليات شركتك الذكي" : "Your Smart Company HQ"}</span>
            </motion.div>

            <h2 className="font-display text-[2.5rem] md:text-6xl font-extrabold tracking-tight mb-5 leading-[1.1]">
              <span className="block text-white">
                {language === "ar" ? "حوّل فكرتك" : "Turn your idea"}
              </span>
              <span className="block brand-gradient-text pb-1">
                {language === "ar" ? "إلى شركة ناجحة" : "into a thriving company"}
              </span>
            </h2>

            <p className="text-[15px] md:text-lg text-neutral-300/90 max-w-xl mx-auto leading-[1.85]">
              {language === "ar"
                ? "سبعة أقسام وأكثر من ٥٠ مساعداً ذكياً يعملون كفريقك المؤسّس على مدار الساعة."
                : "7 departments and 50+ AI agents working as your full-time founding team."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            <Link href="/auth/signup">
              <Button variant="hero" size="hero" className="rounded-full w-full sm:w-auto glow-pulse">
                {language === "ar" ? "ابدأ مجاناً الآن" : "Start Free Now"}
                <Sparkles className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="glass" size="hero" className="rounded-full w-full sm:w-auto">
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="pt-2"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-cyan-300"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            >
              <Globe className="h-3.5 w-3.5" />
              {language === "en" ? "تبديل للعربية" : "Switch to English"}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ───────────── Logged-in shell ─────────────
  return (
    <div className="flex min-h-screen bg-[#05070D] overflow-hidden" dir={dir}>
      <Sidebar />

      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen w-full transition-all duration-300",
          dir === "rtl" ? "md:mr-72" : "md:ml-72"
        )}
      >
        {/* Premium glass-toolbar Header */}
        <header className="h-16 glass-toolbar flex items-center justify-between px-3 md:px-6 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="md:hidden">
              <BrandLogo size={34} showWordmark={false} href="/dashboard" glow iconOnly />
            </div>
            <div className="md:hidden leading-tight min-w-0">
              <p className="text-[9.5px] text-cyan-300/70 uppercase tracking-[0.20em] font-semibold">
                {language === "ar" ? "مرحباً" : "Welcome"}
              </p>
              <p className="text-[13.5px] font-bold text-white truncate max-w-[140px]">
                {dbUser?.name || user.displayName || (language === "ar" ? "صديقي" : "Friend")}
              </p>
            </div>

            {/* Desktop premium search */}
            <button
              type="button"
              className="hidden md:flex items-center gap-2.5 px-3.5 h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 hover:bg-white/[0.05] transition-all w-80 group focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060B] outline-none"
              aria-label={language === "ar" ? "بحث" : "Search"}
            >
              <Search className="w-4 h-4 text-neutral-500 group-hover:text-cyan-300 transition-colors" />
              <span className="flex-1 text-start text-[13px] text-neutral-500 group-hover:text-neutral-400 transition-colors truncate">
                {language === "ar" ? "ابحث في وكلائك أو خططك…" : "Search agents, plans…"}
              </span>
              <kbd className="text-[10px] font-mono text-neutral-400 bg-white/[0.04] border border-white/10 rounded-md px-1.5 py-0.5 shadow-[inset_0_-1px_0_rgb(0_0_0/0.3)]">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-cyan-300 hover:bg-white/[0.05]"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              aria-label={language === "ar" ? "تبديل اللغة" : "Switch language"}
            >
              <Globe className="h-[18px] w-[18px]" />
            </Button>

            <div className="hidden sm:block text-neutral-400">
              <NotificationBell />
            </div>

            <div className="hidden sm:block">
              <CreditsIndicator />
            </div>

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />

            <Link
              href="/profile"
              className="hidden md:flex items-center gap-3 group rounded-xl px-2 py-1 hover:bg-white/[0.04] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060B] outline-none"
            >
              <div className={cn("hidden lg:block leading-tight", dir === "rtl" ? "text-right" : "text-left")}>
                <p className="text-[13px] font-bold text-white">{dbUser?.name || user.displayName}</p>
                <p className="text-[9.5px] text-cyan-300/70 uppercase tracking-[0.20em] mt-0.5">
                  {(dbUser as any)?.industry || (language === "ar" ? "مؤسس" : "Founder")}
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-70 group-hover:opacity-100 blur-[2px] transition-opacity" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]">
                  {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
                </div>
                <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#04060B]" />
              </div>
            </Link>

            <Link href="/profile" className="md:hidden">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-70 blur-[2px]" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]">
                  {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
                </div>
                <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#04060B]" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-28 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-4 md:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </div>
      </main>

      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

      {/* Mobile sectioned menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 max-h-[88vh] bg-gradient-to-b from-[#0B1020] to-[#070A18] border-t border-white/10 rounded-t-[28px] shadow-[0_-30px_80px_-20px_rgb(0_0_0/0.8)] flex flex-col"
            >
              <div className="flex justify-center pt-3">
                <div className="w-12 h-1.5 rounded-full bg-white/15" />
              </div>
              <div className="flex justify-between items-center px-5 py-4">
                <BrandLogo size={36} iconOnly />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={language === "ar" ? "إغلاق" : "Close"}
                  className="rounded-xl"
                >
                  <X className="h-5 w-5 text-white" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.heading} className="mb-5">
                    <div className="px-2 pt-2 pb-2.5 text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-300/70">
                      {section.heading}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active =
                          pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-3.5 py-3.5 rounded-2xl transition-all text-sm border",
                              active
                                ? "bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 border-indigo-400/30 text-white"
                                : "bg-white/[0.025] border-white/5 text-neutral-300 active:scale-95"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4 shrink-0",
                                active ? "text-cyan-300" : "text-neutral-500"
                              )}
                            />
                            <span className="truncate font-semibold">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-3 border-t border-white/[0.06] pb-[calc(env(safe-area-inset-bottom)+12px)] grid grid-cols-2 gap-2">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-semibold text-sm"
                >
                  {language === "ar" ? "الإعدادات" : "Settings"}
                </Link>
                <button
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 font-semibold text-sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {language === "ar" ? "خروج" : "Sign out"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

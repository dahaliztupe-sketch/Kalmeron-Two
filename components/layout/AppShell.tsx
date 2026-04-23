"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, X, LogOut, Bell, Search, Sparkles } from "lucide-react";
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

  // ───────────── Logged-out splash ─────────────
  if (!user) {
    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden mesh-gradient aurora-bg starfield"
        dir={dir}
      >
        <div className="z-10 text-center max-w-2xl px-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40 blur-3xl logo-halo" />
              <div className="relative w-full h-full rounded-3xl border border-white/10 shadow-2xl bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center">
                <img
                  src="/brand/kalmeron-mark.svg"
                  alt="Kalmeron AI"
                  className="w-[78%] h-[78%] object-contain"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs text-cyan-200 mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "نظام تشغيل رواد الأعمال" : "Operating System for Founders"}</span>
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
              <span className="block text-white">
                {language === "ar" ? "حوّل فكرتك" : "Turn your idea"}
              </span>
              <span className="block brand-gradient-text">
                {language === "ar" ? "إلى شركة ناجحة" : "into a thriving company"}
              </span>
            </h2>

            <p className="text-base md:text-lg text-neutral-300 max-w-lg mx-auto leading-relaxed">
              {language === "ar"
                ? "7 أقسام و+50 وكيلاً ذكياً يعملون كفريقك المؤسس على مدار الساعة."
                : "7 departments and 50+ AI agents working as your full-time founding team."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/auth/signup">
              <Button className="h-14 px-10 rounded-full text-base btn-primary w-full sm:w-auto glow-pulse">
                {language === "ar" ? "ابدأ مجاناً" : "Start Free"}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="h-14 px-8 rounded-full text-base btn-ghost w-full sm:w-auto"
              >
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
        {/* Header */}
        <header className="h-16 border-b border-white/[0.06] bg-[#0B1020]/70 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden">
              <BrandLogo size={34} showWordmark={false} href="/dashboard" glow iconOnly />
            </div>
            <div className="md:hidden leading-tight min-w-0">
              <p className="text-[10px] text-cyan-300/70 uppercase tracking-wider">
                {language === "ar" ? "مرحباً" : "Welcome"}
              </p>
              <p className="text-sm font-bold text-white truncate max-w-[140px]">
                {dbUser?.name || user.displayName || (language === "ar" ? "صديقي" : "Friend")}
              </p>
            </div>

            {/* Desktop search */}
            <div className="hidden md:flex items-center gap-2 px-3.5 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-white/15 transition-colors w-72">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                placeholder={language === "ar" ? "ابحث في وكلائك أو خططك…" : "Search agents, plans…"}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 outline-none border-none"
              />
              <kbd className="text-[10px] text-neutral-500 border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-cyan-300 h-9 w-9 rounded-xl"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              aria-label={language === "ar" ? "تبديل اللغة" : "Switch language"}
            >
              <Globe className="h-[18px] w-[18px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-neutral-400 hover:text-cyan-300 h-9 w-9 rounded-xl hidden sm:flex"
              aria-label={language === "ar" ? "الإشعارات" : "Notifications"}
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
            </Button>

            <div className="hidden sm:block">
              <CreditsIndicator />
            </div>

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />

            <Link href="/profile" className="hidden md:flex items-center gap-3 group">
              <div className={cn("text-right hidden lg:block leading-tight", dir === "ltr" && "text-left")}>
                <p className="text-sm font-bold text-white">{dbUser?.name || user.displayName}</p>
                <p className="text-[10px] text-cyan-300/70 uppercase tracking-widest">
                  {(dbUser as any)?.industry || (language === "ar" ? "مؤسس" : "Founder")}
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-70 group-hover:opacity-100 blur-[2px] transition-opacity" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                  {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
                </div>
              </div>
            </Link>

            <Link href="/profile" className="md:hidden">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-70 blur-[2px]" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                  {(dbUser?.name || user.displayName)?.charAt(0) || "U"}
                </div>
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
              className="absolute bottom-0 inset-x-0 max-h-[88vh] bg-[#0B1020] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col"
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

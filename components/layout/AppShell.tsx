"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X, LogOut, Settings, User, LayoutDashboard, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import Loading from "@/app/loading";

import Image from "next/image";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, dbUser, loading, signInWithGoogle, signOut: logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dir = language === "ar" ? "rtl" : "ltr";

  // Use the Loading component for the global loading state
  if (loading) return <Loading />;

  // Auth Guard / Login Page
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
            <Button 
                onClick={signInWithGoogle} 
                className="h-16 px-12 rounded-full text-xl bg-white text-black hover:bg-neutral-200 font-bold transition-all hover:scale-105 active:scale-95"
            >
              {language === 'ar' ? 'بدء الرحلة' : 'Enter the Future'}
            </Button>
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

  // If user is logged in, show the full app with Sidebar and Footer
  return (
    <div className="flex h-screen bg-[#06060A] overflow-hidden" dir={dir}>
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300",
        language === 'ar' ? "mr-64" : "ml-64" // Offset for the fixed sidebar
      )}>
        {/* Header */}
        <header className="h-20 border-b border-neutral-900 bg-[#0A0A0F]/80 backdrop-blur-xl flex items-center justify-between px-8 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6 text-white" />
            </Button>
            <Image src="/logo.jpg" alt="Logo" width={140} height={35} className="h-8 w-auto md:hidden" />
          </div>
          
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-[rgb(var(--gold))]" onClick={() => setLanguage(language === "en" ? "ar" : "en")}>
                <Globe className="h-5 w-5" />
             </Button>
             
             <div className="h-8 w-[1px] bg-neutral-800 mx-2 hidden sm:block" />

             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white leading-tight">{dbUser?.name || user.displayName}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{dbUser?.industry || "Entrepreneur"}</p>
                </div>
                <Link href="/profile">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold cursor-pointer hover:border-[rgb(var(--gold))] transition-all active:scale-90">
                        {user.displayName?.charAt(0) || "U"}
                    </div>
                </Link>
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="min-h-[calc(100vh-80px)]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-10"
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
                className="fixed inset-0 z-50 md:hidden flex justify-end"
              >
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                  <motion.div 
                    initial={{ x: dir === 'rtl' ? "100%" : "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: dir === 'rtl' ? "100%" : "-100%" }}
                    className="w-full max-w-[280px] bg-[#0A0A0F] h-full shadow-2xl relative p-8 flex flex-col"
                  >
                        <div className="flex justify-between items-center mb-10">
                            <Image src="/logo.jpg" alt="Logo" width={140} height={35} className="h-8 w-auto" />
                            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                <X className="h-6 w-6 text-white" />
                            </Button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="space-y-4 flex-1">
                             <MobileNavLink href="/dashboard" icon={<LayoutDashboard />} label="لوحة التحكم" active={pathname === "/dashboard"} />
                             <MobileNavLink href="/chat" icon={<MessageSquareText />} label="مستشار كلميرون" active={pathname === "/chat"} />
                        </nav>
                        
                        <div className="pt-8 border-t border-neutral-900 space-y-4">
                            <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-500/10" onClick={logout}>
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

function MobileNavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link href={href} className={cn(
            "flex items-center gap-4 p-4 rounded-2xl transition-all font-bold",
            active ? "bg-[rgb(var(--gold))]/10 text-[rgb(var(--gold))]" : "text-neutral-400 hover:bg-neutral-900"
        )}>
            {icon} {label}
        </Link>
    )
}

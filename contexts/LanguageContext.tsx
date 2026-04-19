"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "app.title": "Kalmeron Two",
    "app.subtitle": "Your AI Co-Founder for the Egyptian Market",
    "auth.login": "Sign in with Google",
    "auth.loading": "Loading...",
    "nav.dashboard": "Dashboard",
    "nav.chat": "Startup Chat",
    "nav.idea": "Idea Validation",
    "nav.plan": "Business Plan",
    "nav.mistakes": "Mistake Shield",
    "nav.success": "Success Museum",
    "nav.radar": "Opportunity Radar",
    "dashboard.welcome": "Welcome back",
    "chat.placeholder": "Type your message...",
    "chat.send": "Send",
  },
  ar: {
    "app.title": "كالميرون تو",
    "app.subtitle": "شريكك المؤسس المدعوم بالذكاء الاصطناعي للسوق المصري",
    "auth.login": "تسجيل الدخول بجوجل",
    "auth.loading": "جاري التحميل...",
    "nav.dashboard": "غرفة القيادة",
    "nav.chat": "المستشار الاستراتيجي",
    "nav.idea": "التحليل الاستراتيجي",
    "nav.plan": "هندسة الخطط",
    "nav.mistakes": "درع الحماية",
    "nav.success": "مسارات النجاح",
    "nav.radar": "رادار الفرص",
    "dashboard.welcome": "غرفة القيادة الاستراتيجية",
    "chat.placeholder": "صف فكرتكم أو اطرح سؤالك.. كلميرون هنا للرد.",
    "chat.send": "إرسال",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved === "ar" || saved === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

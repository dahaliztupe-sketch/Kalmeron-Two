"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Home, MessageSquare, Search, Compass } from "lucide-react";

export default function NotFound() {
  const links = [
    { href: "/dashboard", icon: Home, label: "لوحة التحكم" },
    { href: "/chat", icon: MessageSquare, label: "المحادثة" },
    { href: "/pricing", icon: Compass, label: "الأسعار" },
  ];

  return (
    <div className="min-h-screen bg-[#05070D] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:50px_50px]" />
      </div>

      <div className="relative max-w-lg mx-auto text-center">
        {/* 404 Big number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          className="relative mb-6"
        >
          <div className="font-display text-[160px] md:text-[200px] font-extrabold leading-none brand-gradient-text opacity-20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl"
            >
              🧭
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-10"
        >
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
            وصلت لمكان غير موجود!
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-md mx-auto">
            الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لكن لا تقلق — وكلاؤنا الذكيون على استعداد لمساعدتك في أي اتجاه آخر.
          </p>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          {links.map((l, i) => {
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] text-sm text-neutral-200 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all"
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Link href="/"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

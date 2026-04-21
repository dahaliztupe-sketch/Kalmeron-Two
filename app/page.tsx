'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Search, Sparkles, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to chat as a guest with the query
      router.push(`/chat?q=${encodeURIComponent(query)}`);
    }
  };

  const suggestions = [
    "حلل فكرة منصة تعليمية للمستقلين",
    "ابني خطة عمل لمتجري الإلكتروني",
    "ما هي الفرص في قطاع الصحة الرقمية؟",
    "احسب لي التكاليف المبدئية لمطعم سحابي"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0B] text-white flex flex-col items-center justify-center font-sans" dir="rtl">
      
      {/* Navbar CTA */}
      <nav className="absolute top-0 w-full flex justify-between p-6 z-50">
        <div className="font-bold text-xl tracking-tighter flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" /> Kalmeron
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
            <LogIn className="w-4 h-4" /> تسجيل الدخول
          </Link>
          <Link href="/auth/signup" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> إنشاء حساب
          </Link>
        </div>
      </nav>

      {/* Aurora Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/30 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/20 blur-[120px] rounded-full"
        />
      </div>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-3xl flex flex-col items-center px-4 mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 leading-tight"
        >
          حوّل فكرتك إلى واقع
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-neutral-400 text-center mb-12 max-w-xl"
        >
          شريكك المؤسس المدعوم بالذكاء الاصطناعي. اسأل، خطط، وابدأ مشروعك الآن.
        </motion.p>

        {/* Prompt Bar */}
        <motion.form 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="w-full relative shadow-2xl shadow-black/50"
        >
          <div className="relative flex items-center w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 transition-all focus-within:border-white/30 focus-within:bg-neutral-900">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بم تفكر اليوم؟ الخطوة الأولى تبدأ هنا..."
              className="flex-1 bg-transparent border-none outline-none text-white px-4 text-lg placeholder-neutral-500"
            />
            <button 
              type="submit"
              disabled={!query}
              className="bg-white text-black rounded-full p-3 m-1 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </motion.form>

        {/* Suggestions Row */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-8"
        >
          {suggestions.map((text, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(text);
              }}
              className="text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 px-4 py-2 rounded-xl transition-colors"
            >
              {text}
            </button>
          ))}
        </motion.div>
      </main>
      
    </div>
  );
}

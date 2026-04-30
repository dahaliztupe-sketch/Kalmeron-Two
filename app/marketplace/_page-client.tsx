'use client';

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { DownloadCloud, Star, Store, Verified } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_TEMPLATES = [
  {
    id: 1,
    title: 'مساعد الشؤون القانونية للشركات',
    author: 'أحمد محمود (محام تجاري)',
    stars: 4.9,
    downloads: '1.2k',
    verified: true,
    tag: 'قانوني'
  },
  {
    id: 2,
    title: 'محلل إعلانات السوشيال ميديا',
    author: 'فريق تسويق GrowthX',
    stars: 4.7,
    downloads: '850',
    verified: true,
    tag: 'تسويق'
  },
  {
    id: 3,
    title: 'مُقيّم جودة المتاجر الإلكترونية',
    author: 'يوسف جمال',
    stars: 4.5,
    downloads: '320',
    verified: false,
    tag: 'تجارة إلكترونية'
  }
];

export default function MarketplacePage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12 font-sans" dir="rtl">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-blue-400 mb-4">
            <Store className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-white">متجر المساعدين (Marketplace)</h1>
          </div>
          <p className="text-neutral-400 max-w-2xl text-lg">
            اكتشف واستورد مساعدين ذكاء اصطناعي وأدوات تخطيط مُعدة مسبقاً بواسطة مجتمع رواد الأعمال والخبراء لتسريع إنجاز أعمالك.
          </p>
        </header>

        <h2 className="text-lg font-semibold text-neutral-400 mb-4">المساعدون المتاحون</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_TEMPLATES.map((item, idx) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 rounded-2xl p-6 transition-colors group cursor-pointer"
             >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full border border-blue-700/50">
                    {item.tag}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
                    <Star className="w-4 h-4 fill-amber-400" /> {item.stars}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-200 transition-colors">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-6">
                  صُنع بواسطة: <span className="font-medium text-neutral-300">{item.author}</span>
                  {item.verified && <Verified className="w-4 h-4 text-blue-500" />}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                   <div className="flex items-center gap-2 text-neutral-500 text-sm whitespace-nowrap">
                      <DownloadCloud className="w-4 h-4" /> {item.downloads} تحميل
                   </div>
                   <button className="bg-white/10 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                     استيراد المساعد
                   </button>
                </div>
             </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-neutral-400 text-sm mb-4">هل تحتاج مساعدة في اختيار المساعد المناسب؟</p>
          <Link
            href="/chat?q=أنصحني بأفضل مساعد ذكي يناسب مشروعي"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            استشر كلميرون الآن
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

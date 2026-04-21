"use client";

import Link from "next/link";

import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-900 bg-[#06060A] py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="space-y-6 text-center md:text-right">
          <Image src="/brand/logo.svg" alt="Kalmeron Two Logo" width={180} height={45} className="mx-auto md:mx-0" style={{ height: '2.5rem', width: 'auto' }} />
          <p className="text-neutral-500 text-lg max-w-xs font-medium leading-relaxed">
            شريكك المؤسس المدعوم بالذكاء الاصطناعي للسوق المصري، مصمم لتمكينك من اختراق الحواجز وبناء المستقبل.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-16 gap-y-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <span className="text-white font-black text-sm uppercase tracking-widest pb-2 border-b border-[rgb(var(--gold))]/20">المنصة</span>
            <Link href="/dashboard" className="text-neutral-400 hover:text-[rgb(var(--gold))] text-md font-bold transition-colors">لوحة التحكم</Link>
            <Link href="/chat" className="text-neutral-400 hover:text-[rgb(var(--gold))] text-md font-bold transition-colors">مستشار كلميرون</Link>
            <Link href="/ideas/analyze" className="text-neutral-400 hover:text-[rgb(var(--gold))] text-md font-bold transition-colors">تحليل الفكرة</Link>
          </div>
          
          <div className="flex flex-col gap-4 items-center md:items-start">
            <span className="text-white font-black text-sm uppercase tracking-widest pb-2 border-b border-[rgb(var(--gold))]/20">قانوني</span>
            <Link href="/privacy" className="text-neutral-400 hover:text-[rgb(var(--gold))] text-md font-bold transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="text-neutral-400 hover:text-[rgb(var(--gold))] text-md font-bold transition-colors">شروط الاستخدام</Link>
          </div>

          <div className="flex flex-col gap-4 items-center md:items-start">
            <span className="text-white font-black text-sm uppercase tracking-widest pb-2 border-b border-[rgb(var(--gold))]/20">المجتمع</span>
            <Link href="/success-museum" className="text-neutral-400 hover:text-[rgb(var(--gold))] text-md font-bold transition-colors">متحف النجاح</Link>
            <Link href="/opportunities" className="text-neutral-400 hover:text-[rgb(var(--gold))] text-md font-bold transition-colors">رادار الفرص</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-neutral-600 text-xs font-bold uppercase tracking-widest">
            Kalmeron Two © {currentYear}
        </p>
        <p className="text-neutral-600 text-[10px] text-center font-medium max-w-sm">
          جميع الحقوق محفوظة. المنصة مصممة لدعم الابتكار في جمهورية مصر العربية.
        </p>
      </div>
    </footer>
  );
}

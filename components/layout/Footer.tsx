"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TrustBadges } from "@/components/marketing/TrustBadges";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] bg-[#05070D] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="space-y-4 max-w-sm">
          <BrandLogo size={40} iconOnly />
          <p className="text-neutral-500 text-sm leading-relaxed">
            شريكك المؤسس المدعوم بالذكاء الاصطناعي للسوق المصري — مصمم لتمكينك من اختراق الحواجز وبناء المستقبل.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <FooterCol heading="المنصة">
            <FLink href="/dashboard">لوحة التحكم</FLink>
            <FLink href="/chat">مستشار كلميرون</FLink>
            <FLink href="/ideas/analyze">تحليل الفكرة</FLink>
          </FooterCol>
          <FooterCol heading="قانوني">
            <FLink href="/privacy">سياسة الخصوصية</FLink>
            <FLink href="/terms">شروط الاستخدام</FLink>
            <FLink href="/compliance">الامتثال</FLink>
          </FooterCol>
          <FooterCol heading="المجتمع">
            <FLink href="/success-museum">متحف النجاح</FLink>
            <FLink href="/opportunities">رادار الفرص</FLink>
            <FLink href="/marketplace">السوق</FLink>
            <FLink href="/changelog">سجل التحديثات</FLink>
            <FLink href="/first-100">عرض أول 100 شركة</FLink>
          </FooterCol>
        </div>
      </div>

      {/* Trust badges (P0 / QW-2 from the 45-expert business audit) */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/[0.04]">
        <TrustBadges />
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-neutral-600 text-xs font-bold uppercase tracking-widest">
          Kalmeron AI © {currentYear}
        </p>
        <p className="text-neutral-600 text-[11px] text-center max-w-md">
          جميع الحقوق محفوظة. مصممة لدعم الابتكار في جمهورية مصر العربية.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 min-w-[120px]">
      <span className="text-cyan-300/80 font-bold text-[11px] uppercase tracking-[0.22em]">
        {heading}
      </span>
      {children}
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-neutral-400 hover:text-white text-sm font-medium transition-colors">
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TrustBadges } from "@/components/marketing/TrustBadges";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] bg-[#05070D] py-12 px-6" role="contentinfo">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="space-y-4 max-w-sm">
          <BrandLogo size={40} iconOnly />
          <p className="text-neutral-300 text-sm leading-relaxed">
            شريكك الذكي في بناء شركتك — من الفكرة الأولى إلى التوسع والنمو.
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
        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">
          Kalmeron AI © {currentYear}
        </p>
        <p className="text-neutral-400 text-[11px] text-center max-w-md">
          جميع الحقوق محفوظة. مصنوعة لرائد الأعمال في كل مكان.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <nav className="flex flex-col gap-3 min-w-[120px]" aria-label={heading}>
      <span className="text-cyan-300 font-bold text-[11px] uppercase tracking-[0.22em]">
        {heading}
      </span>
      {children}
    </nav>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-neutral-300 hover:text-white text-sm font-medium transition-colors focus-visible:text-white focus-visible:underline focus-visible:underline-offset-4"
    >
      {children}
    </Link>
  );
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الأسعار والباقات — كلميرون",
  description: "ابدأ مجاناً بـ ٢٠٠ رسالة يومياً. الخطط المدفوعة تبدأ من ١٩٩ جنيه شهرياً فقط — أقل من تكلفة ساعة مع مستشار. لا بطاقة ائتمان، إلغاء في أي وقت.",
  openGraph: {
    title: "أسعار كلميرون — ابدأ مجاناً اليوم",
    description: "ابدأ مجاناً بـ ٢٠٠ رسالة يومياً. خطط تبدأ من ١٩٩ جنيه/شهر. ٥٧ مساعداً ذكياً في كل خطة.",
  },
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PageClient />;
}

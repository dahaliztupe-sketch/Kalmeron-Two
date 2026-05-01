import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الخطط والأسعار — كلميرون",
  description: "ابدأ مجاناً بـ ٢٠٠ رسالة يومياً. الخطط المدفوعة بأقل من تكلفة ساعة واحدة مع مستشار — ٥٧ مساعداً ذكياً في كل خطة. لا بطاقة ائتمان، إلغاء في أي وقت.",
  openGraph: {
    title: "أسعار كلميرون — ابدأ مجاناً اليوم",
    description: "ابدأ مجاناً بـ ٢٠٠ رسالة يومياً. ٥٧ مساعداً ذكياً في ٧ أقسام — بأسعار في متناول كل رائد أعمال.",
  },
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PageClient />;
}

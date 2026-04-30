import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الإعداد الأوّل | ابدأ مع كلميرون في دقائق",
  description: "أكمل إعداد حسابك في Kalmeron AI: أضف معلومات شركتك، اختر مرحلة نموك، وخصّص مساعديك الذكيين لتبدأ رحلتك نحو بناء شركة ناجحة.",
};

export default function Page() {
  return <PageClient />;
}

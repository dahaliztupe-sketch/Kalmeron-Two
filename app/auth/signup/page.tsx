import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "إنشاء حساب مجاني في Kalmeron AI",
  description: "ابدأ مع Kalmeron AI مجاناً وانضم إلى آلاف رواد الأعمال العرب. احصل على 16 مساعداً ذكياً متخصصاً يعملون كفريقك المؤسّس بالعربية الأصيلة.",
};

export default function Page() {
  return <PageClient />;
}

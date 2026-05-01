import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "تسجيل الدخول إلى Kalmeron AI",
  description: "ادخل إلى حسابك في Kalmeron AI واستأنف العمل مع فريقك الذكي المؤسّس: ٥٧ مساعداً ذكياً يعملون معك على مدار الساعة لتنمية شركتك.",
};

export default function Page() {
  return <PageClient />;
}

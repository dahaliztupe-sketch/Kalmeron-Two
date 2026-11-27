import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "تسجيل الدخول إلى Kalmeron AI",
  description: "ادخل إلى حسابك في Kalmeron AI واستأنف العمل مع فريقك الذكي المؤسّس: مساعدون بالذكاء الاصطناعي يجهّزون لك مسودات (تجريبي).",
};

export default function Page() {
  return <PageClient />;
}

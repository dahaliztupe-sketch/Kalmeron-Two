import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "إنشاء حساب مجاني في Kalmeron AI",
  description: "ابدأ مجاناً وادخل إلى نظام تشغيل شركتك — سبعة أقسام تشغيلية تعمل معاً في منصة واحدة مُصمَّمة للمؤسسين.",
};

export default function Page() {
  return <PageClient />;
}

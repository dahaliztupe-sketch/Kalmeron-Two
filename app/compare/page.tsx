import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "مقارنة خطط Kalmeron AI | أيّ باقة تناسبك؟",
  description: "قارن خطط Kalmeron AI وأقسامها الذكية: الحر، المحترف، والمؤسسي. اعرف الفرق بين 16 مساعداً ذكياً وخدماتهم لتختار الخطة الأنسب لمشروعك.",
};

export default function Page() {
  return <PageClient />;
}

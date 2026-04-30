import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "درع الأخطاء | اكتشف أخطاء مشروعك قبل فوات الأوان",
  description: "درع الأخطاء من كلميرون يحلل مشروعك ويكشف الأخطاء الشائعة التي تُفشل 90% من الشركات الناشئة. مستوحى من تجارب 1000+ رائد أعمال في السوق العربي.",
};

export default function Page() {
  return <PageClient />;
}

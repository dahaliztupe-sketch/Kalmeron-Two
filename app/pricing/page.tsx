import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الأسعار والباقات",
  description: "اختر الباقة المناسبة لشركتك الناشئة — من الباقة المجانية حتى الباقة المؤسسية. أسعار بالجنيه المصري والدولار مع ضمان استرداد الأموال خلال 14 يوماً.",
};

export default function Page() {
  return <PageClient />;
}

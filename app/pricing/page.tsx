import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الأسعار والباقات",
  description: "اختر الباقة المناسبة لشركتك الناشئة",
};

export default function Page() {
  return <PageClient />;
}

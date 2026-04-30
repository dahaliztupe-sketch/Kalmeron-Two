import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "درع الأخطاء",
  description: "اكتشف الأخطاء الشائعة قبل وقوعها",
};

export default function Page() {
  return <PageClient />;
}

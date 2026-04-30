import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "متجر الوكلاء",
  description: "تصفّح وأضف مساعدين أذكياء جدد لمنصّتك",
};

export default function Page() {
  return <PageClient />;
}

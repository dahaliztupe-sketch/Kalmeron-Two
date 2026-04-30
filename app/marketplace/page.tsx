import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "متجر الوكلاء الذكيين — Kalmeron AI",
  description: "تصفّح وأضف مساعدين أذكياء جدد لمنصّتك من متجر Kalmeron AI. وكلاء متخصصون في المبيعات والتسويق والقانون والمحاسبة والموارد البشرية باللغة العربية.",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import WeeklyReportClient from "./_weekly-client";

export const metadata: Metadata = {
  title: "التقرير الأسبوعي | Kalmeron AI",
  description: "تقرير أسبوعي شامل يجمع نشاط الوكلاء الذكيين، تقدم OKR، التنبيهات، والفرص المتاحة.",
  alternates: { canonical: "/weekly-report" },
};

export default function WeeklyReportPage() {
  return <WeeklyReportClient />;
}

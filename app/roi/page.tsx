import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "حاسبة ROI | احسب عائد استخدام كلميرون في شركتك",
  description: "احسب العائد الفعلي على استثمارك في Kalmeron AI: وفّر تكاليف التوظيف، أسرع في الإنجاز، وقيّم المقارنة بين استخدام المساعدين الذكيين ومقابل موظفين بدوام كامل.",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حارس الأخطاء | كلميرون",
  description: "تجنّب أكثر 10 أخطاء يقع فيها رواد الأعمال المصريون. تحليل ذكي لمخاطر مشروعك قبل وقوعها.",
};

export default function MistakeShieldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

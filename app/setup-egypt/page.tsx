import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "تأسيس شركة في مصر | دليل كلميرون الشامل 2025",
  description: "دليل عملي خطوة بخطوة لتأسيس شركتك في مصر: الأوراق المطلوبة، التكاليف، الجهات المختصة، الشركة الفردية مقابل ذات المسؤولية المحدودة، والجداول الزمنية الواقعية.",
};

export default function Page() {
  return <PageClient />;
}

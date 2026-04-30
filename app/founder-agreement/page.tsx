import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "اتفاقية المؤسّسين | احمِ شراكتك من البداية",
  description: "أنشئ اتفاقية مؤسّسين احترافية وملزمة قانونياً بالعربية: توزيع الحصص، الحقوق والواجبات، آليات الخروج، والبنود الجوهرية لحماية شراكتك في الشركة الناشئة.",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الأسعار — كلميرون",
  description: "لم تُحدَّد أسعار كلميرون بعد. المشروع تجريبي ومتوقف مؤقتاً، ولا توجد بوابة دفع مفعّلة.",
  openGraph: {
    title: "أسعار كلميرون — لم تُحدَّد بعد",
    description: "لم تُحدَّد أسعار كلميرون بعد. لن يُطلب منك أي مبلغ قبل الإعلان عن الأسعار.",
  },
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PageClient />;
}

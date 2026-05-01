import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "لماذا كلميرون؟ — مقارنة مع ChatGPT وNotion AI وغيرها",
  description: "كلميرون هو الخيار الأوّل للمؤسّس العربي — ٥٧ مساعداً ذكياً يفهمون السوق المصري وقانون العمل والبيئة العربية. قارن مع ChatGPT وNotion AI وJasper.",
  openGraph: {
    title: "لماذا كلميرون وليس ChatGPT؟",
    description: "كلميرون مبني للمؤسّس العربي — يفهم السوق المصري، قانون الشركات، والبيئة العربية. ليس أداةً عامة.",
  },
  alternates: { canonical: "/compare" },
};

export default function Page() {
  return <PageClient />;
}

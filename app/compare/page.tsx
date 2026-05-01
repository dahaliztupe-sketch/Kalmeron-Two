import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "لماذا كلميرون؟ — مقارنة مع ChatGPT وNotion AI وغيرها",
  description: "كلميرون هو الخيار الأوّل للمؤسّس — ٥٧ مساعداً ذكياً متخصصاً في قانون الشركات والنمذجة المالية والتسويق. قارن مع ChatGPT وNotion AI وJasper.",
  openGraph: {
    title: "لماذا كلميرون وليس ChatGPT؟",
    description: "كلميرون مبني للمؤسّس — يفهم سوقك، قانون الشركات، والبيئة العربية. ليس أداةً عامة — فريق مساعدين متخصصين.",
  },
  alternates: { canonical: "/compare" },
};

export default function Page() {
  return <PageClient />;
}

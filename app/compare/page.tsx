import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "لماذا كلميرون؟ — مقارنة مع ChatGPT وNotion AI وغيرها",
  description: "لماذا كلميرون؟ منصة موحّدة تجمع المالية، القانون، التسويق، والعمليات في مكان واحد. قارن مع ChatGPT وNotion AI وأدوات أخرى.",
  openGraph: {
    title: "لماذا كلميرون وليس ChatGPT؟",
    description: "كلميرون مبني للمؤسّس — يفهم سوقك، قانون الشركات، والبيئة العربية. ليس أداةً عامة — فريق مساعدين متخصصين.",
  },
  alternates: { canonical: "/compare" },
};

export default function Page() {
  return <PageClient />;
}

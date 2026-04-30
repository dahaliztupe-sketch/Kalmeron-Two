import type { Metadata } from "next";
import StartClient from "./_start-client";

export const metadata: Metadata = {
  title: "ابدأ محادثة جديدة | Kalmeron AI",
  description: "ابدأ محادثة جديدة مع مساعدي كلميرون الأذكياء — تحليل الأفكار التجارية، بناء خطط العمل، الاستشارة القانونية، التحليل المالي، والتسويق، كل ذلك باللغة العربية.",
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return <StartClient />;
}

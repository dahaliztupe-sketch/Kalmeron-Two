import type { Metadata } from "next";
import StartClient from "./_start-client";

export const metadata: Metadata = {
  title: "ابدأ محادثة جديدة | Kalmeron AI",
  description: "ابدأ محادثة جديدة مع وكلاء كلميرون الأذكياء — تحليل أفكار، خطط عمل، استشارة قانونية، وأكثر.",
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return <StartClient />;
}

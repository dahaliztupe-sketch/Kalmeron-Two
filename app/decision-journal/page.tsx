import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "يوميات القرارات | سجّل قراراتك وتعلّم من تجاربك",
  description: "وثّق قراراتك التجارية المهمة، التحليلات التي أجريتها، والنتائج التي حققتها. يوميات القرارات من كلميرون تساعدك على التعلم من كل تجربة وتحسين حكمتك القيادية.",
};

export default function Page() {
  return <PageClient />;
}

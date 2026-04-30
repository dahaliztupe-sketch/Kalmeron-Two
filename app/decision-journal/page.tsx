import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "يوميات القرارات",
  description: "وثّق قراراتك المهمة وتعلّم منها",
};

export default function Page() {
  return <PageClient />;
}

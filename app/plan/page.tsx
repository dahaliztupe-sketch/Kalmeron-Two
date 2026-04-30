import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "خطّة العمل",
  description: "ابنِ خطّة عمل شاملة بالذكاء الاصطناعي",
};

export default function Page() {
  return <PageClient />;
}

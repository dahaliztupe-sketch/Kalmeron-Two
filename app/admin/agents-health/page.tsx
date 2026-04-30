import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "صحة الوكلاء",
  description: "حالة جميع وكلاء الذكاء الاصطناعي ومراقبتهم",
};

export default function Page() {
  return <PageClient />;
}

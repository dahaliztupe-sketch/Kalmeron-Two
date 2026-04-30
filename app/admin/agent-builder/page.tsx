import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "منشئ الوكلاء",
  description: "أنشئ وكلاءك الذكية المخصّصة بسهولة",
};

export default function Page() {
  return (<><h1 className="sr-only">منشئ الوكلاء</h1><PageClient  /></>);
}

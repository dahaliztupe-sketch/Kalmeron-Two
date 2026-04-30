import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الوكلاء الذكيون",
  description: "استكشف 16 مساعداً ذكياً متخصّصاً للأعمال",
};

export default function Page() {
  return (<><h1 className="sr-only">الوكلاء الذكيون</h1><PageClient  /></>);
}

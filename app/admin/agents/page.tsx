import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الوكلاء الذكيون",
  description: "استكشف ٥٧ مساعداً ذكياً متخصّصاً للأعمال عبر ٧ أقسام",
};

export default function Page() {
  return (<><h1 className="sr-only">الوكلاء الذكيون</h1><PageClient  /></>);
}

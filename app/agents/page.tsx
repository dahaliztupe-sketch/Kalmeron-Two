import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  // lexicon-allow
  title: "وكلاء Kalmeron الذكيون | من الفكرة إلى الإمبراطورية",
  description: "٥٧ متخصصاً في المالية، القانون، التسويق، المبيعات، الموارد البشرية، والعمليات — منظّمون في سبعة أقسام تشغيلية مترابطة.",
  robots: "noindex",
};

export default function Page() {
  return (<><h1 className="sr-only">الوكلاء الذكيون</h1><PageClient  /></>);
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الفحص والتدقيق",
  description: "نتائج الفحص الآلي للجودة والأمان",
};

export default function Page() {
  return <PageClient />;
}

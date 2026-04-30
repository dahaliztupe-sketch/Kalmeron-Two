import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "القيمة المقترحة",
  description: "ابنِ عرض قيمة قوي ومميز لمنتجك",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "المدير المالي الذكي",
  description: "محلّل مالي ذكي لشركتك الناشئة",
};

export default function Page() {
  return <PageClient />;
}

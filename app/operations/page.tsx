import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "العمليات",
  description: "إدارة عمليات شركتك اليومية",
};

export default function Page() {
  return <PageClient />;
}

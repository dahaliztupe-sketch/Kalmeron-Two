import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "غرفة العمليات",
  description: "اللوحة الموحّدة لمراقبة المنصة",
};

export default function Page() {
  return <PageClient />;
}

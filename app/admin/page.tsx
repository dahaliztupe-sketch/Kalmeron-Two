import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "لوحة التحكم الإدارية",
  description: "أدوات الإدارة الداخلية لـ Kalmeron AI",
};

export default function Page() {
  return <PageClient />;
}

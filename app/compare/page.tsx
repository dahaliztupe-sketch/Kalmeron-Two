import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "مقارنة الأقسام",
  description: "قارن بين أقسام Kalmeron AI الذكية",
};

export default function Page() {
  return <PageClient />;
}

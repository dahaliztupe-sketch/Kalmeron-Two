import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "ابدأ مع Kalmeron AI مجاناً",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "مختبر السوق",
  description: "اختبر منتجاتك وأفكارك في السوق",
};

export default function Page() {
  return <PageClient />;
}

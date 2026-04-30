import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الفرص",
  description: "استكشف فرصاً جاهزة في السوق المصري",
};

export default function Page() {
  return <PageClient />;
}

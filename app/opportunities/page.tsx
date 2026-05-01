import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "فرص الأعمال — Kalmeron AI",
  description: "استكشف فرصاً تجارية جاهزة في سوقك المستهدف. تحليل ذكي للفرصة، وحجم السوق، والمنافسين، وخطوات التنفيذ — كل ذلك بالعربية الأصيلة.",
};

export default function Page() {
  return <PageClient />;
}

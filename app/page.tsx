import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "Page.Tsx | Kalmeron AI",
  description: "صفحة Page.Tsx في Kalmeron AI",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "ابدأ مع كلميرون",
  description: "خطوات الإعداد السريع لمنصّتك",
};

export default function Page() {
  return <PageClient />;
}

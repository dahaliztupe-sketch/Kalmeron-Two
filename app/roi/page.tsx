import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "حاسبة العائد على الاستثمار",
  description: "احسب توفير التكاليف باستخدام كلميرون",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "متحف النجاحات",
  description: "قصص نجاح حقيقية من رواد الأعمال",
};

export default function Page() {
  return <PageClient />;
}

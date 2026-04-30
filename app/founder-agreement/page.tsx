import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "اتفاقية المؤسّسين",
  description: "أنشئ اتفاقية مؤسّسين قانونية بالعربية",
};

export default function Page() {
  return <PageClient />;
}

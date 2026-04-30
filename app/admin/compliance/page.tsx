import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "الامتثال القانوني",
  description: "حالة الامتثال للوائح المصرية و GDPR",
};

export default function Page() {
  return <PageClient />;
}

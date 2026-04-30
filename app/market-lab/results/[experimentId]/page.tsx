import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "نتائج التجربة",
  description: "تفاصيل تجارب السوق التي أجريتها",
};

export default function Page() {
  return <PageClient />;
}

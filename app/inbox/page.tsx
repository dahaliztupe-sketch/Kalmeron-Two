import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "صندوق الوارد",
  description: "إشعاراتك ورسائلك من جميع الأقسام",
};

export default function Page() {
  return <PageClient />;
}

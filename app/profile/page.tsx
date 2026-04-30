import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "ملفي الشخصي",
  description: "إدارة بياناتك الشخصية وحسابك",
};

export default function Page() {
  return <PageClient />;
}

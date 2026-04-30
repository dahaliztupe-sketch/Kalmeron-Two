import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "إعدادات المنصة",
  description: "إدارة إعدادات النظام العامة",
};

export default function Page() {
  return <PageClient />;
}

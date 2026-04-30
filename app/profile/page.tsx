import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "ملفي الشخصي — Kalmeron AI",
  description: "إدارة بياناتك الشخصية وإعدادات حسابك على Kalmeron AI. تخصيص تجربتك مع المساعدين الذكيين وإدارة الباقة والفوترة والتفضيلات.",
};


export default function Page() {
  return <PageClient />;
}

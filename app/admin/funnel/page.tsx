import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "قمع التحويل",
  description: "تحليل رحلة المستخدم من الزيارة إلى الاشتراك",
};

export default function Page() {
  return <PageClient />;
}

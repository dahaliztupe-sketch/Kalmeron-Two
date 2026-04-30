import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "ادخل إلى حسابك في Kalmeron AI",
};

export default function Page() {
  return <PageClient />;
}

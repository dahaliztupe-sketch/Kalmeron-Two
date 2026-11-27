import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "متحف النجاحات — Kalmeron AI",
  description: "ملخصات عامة عن شركات مصرية معروفة ودروس منها. الأرقام غير موثقة بمصادر في الصفحة، ولا علاقة لهذه الشركات بكلميرون.",
};

export default function Page() {
  return <PageClient />;
}

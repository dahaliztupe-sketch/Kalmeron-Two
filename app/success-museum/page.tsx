import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "متحف النجاحات — Kalmeron AI",
  description: "قصص نجاح حقيقية ملهمة من رواد الأعمال العرب الذين بنوا شركاتهم بمساعدة Kalmeron AI. تعرّف على رحلاتهم ودروسهم المستفادة.",
};

export default function Page() {
  return <PageClient />;
}

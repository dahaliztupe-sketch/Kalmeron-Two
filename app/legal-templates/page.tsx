import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "النماذج القانونية | عقود وقوالب للشركات الناشئة",
  description: "مكتبة نماذج قانونية مُختارة وجاهزة للشركات الناشئة بالعربية والإنجليزية: عقود عمل، اتفاقيات سرية NDA، عقود مع عملاء، ومستندات الشراكة — محدّثة وفق القانون المصري.",
};

export default function Page() {
  return <PageClient />;
}

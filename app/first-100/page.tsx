import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "خطة أول 100 عميل — Kalmeron AI",
  description: "احصل على خطة مخصّصة للوصول إلى أول 100 عميل لشركتك. استراتيجيات مجرّبة في البيع والتسويق والاستهداف بناءً على بيانات السوق المصري والعربي.",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "خطة أول 100 عميل — Kalmeron AI",
  description: "مسودة خطة للوصول إلى أول 100 عميل لشركتك، مولَّدة بالذكاء الاصطناعي وغير مراجعة بشرياً. تجريبي.",
};

export default function Page() {
  return <PageClient />;
}

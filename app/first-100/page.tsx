import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "أول 100 عميل",
  description: "خطّة الوصول لأول 100 عميل لشركتك",
};

export default function Page() {
  return <PageClient />;
}

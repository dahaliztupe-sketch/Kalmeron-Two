import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import ValidateClient from "./_validate-client";

export const metadata: Metadata = {
  title: "تحقق من فكرتك | كلميرون",
  description:
    "اكتب فكرة مشروعك واحصل على تحليل نقدي منظّم: حكم، نقاط قوة وضعف، عميل مستهدف، منافسون، مخاطر، وخطوات عملية بتكلفتها ومدتها.",
  alternates: { canonical: "/validate" },
};

export default async function ValidatePage({
  searchParams,
}: {
  searchParams?: Promise<{ idea?: string | string[] }>;
}) {
  const sp = (await searchParams) ?? {};
  const raw = Array.isArray(sp.idea) ? sp.idea[0] : sp.idea;
  return (
    <PublicShell>
      <ValidateClient initialIdea={(raw ?? "").slice(0, 5000)} />
    </PublicShell>
  );
}

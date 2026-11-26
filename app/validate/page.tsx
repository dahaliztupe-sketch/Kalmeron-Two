import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import ValidateClient from "./_validate-client";

export const metadata: Metadata = {
  title: "تحقق من فكرتك | كلميرون",
  description:
    "اكتب فكرة مشروعك واحصل على تحليل نقدي منظّم: حكم، نقاط قوة وضعف، عميل مستهدف، منافسون، مخاطر، وخطوات عملية بتكلفتها ومدتها.",
  alternates: { canonical: "/validate" },
};

export default function ValidatePage() {
  return (
    <PublicShell>
      <ValidateClient />
    </PublicShell>
  );
}

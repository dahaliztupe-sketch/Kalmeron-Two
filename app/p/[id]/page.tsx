import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { PlanView } from "@/components/plan/PlanView";
import { PrintButton } from "./_print-button";
import { getPlan } from "@/src/lib/plan/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خطة مُتحقق منها | كلميرون",
  robots: { index: false, follow: false },
};

export default async function SharedPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-3xl mx-auto px-4 md:px-8 py-12 print:py-0">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-neutral-400 mb-1">الفكرة</p>
            <h1 className="text-2xl font-bold text-white">{plan.idea}</h1>
          </div>
          <PrintButton />
        </div>
        <PlanView plan={plan} />
      </div>
    </PublicShell>
  );
}

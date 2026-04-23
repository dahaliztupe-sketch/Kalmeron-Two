"use client";
import { useState } from "react";
import { PageShell, Card } from "@/components/ui/page-shell";
import { apiFetch, apiJson } from "@/lib/api-client";
import { toast } from "sonner";

export default function PrivacyPage() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const res = await apiFetch("/api/account/export");
      if (!res.ok) throw new Error("فشل التصدير");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "kalmeron-export.json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("تم التحميل");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("سيتم جدولة حذف حسابك بعد 30 يوماً. هل أنت متأكد؟")) return;
    setDeleting(true);
    try {
      const r = await apiJson<{ scheduledFor: string }>("/api/account/delete", {
        method: "POST",
        body: JSON.stringify({ confirm: true }),
      });
      toast.success(`تم الجدولة حتى ${new Date(r.scheduledFor).toLocaleDateString("ar")}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageShell title="الخصوصية والبيانات" subtitle="تصدير بياناتك أو حذف حسابك (GDPR)">
      <div className="grid gap-4">
        <Card>
          <h2 className="font-semibold mb-2">تصدير البيانات</h2>
          <p className="text-sm text-gray-500 mb-3">
            تحميل نسخة JSON كاملة من جميع بياناتك عبر المنصة.
          </p>
          <button
            onClick={exportData}
            disabled={exporting}
            className="px-4 py-2 border rounded"
          >
            {exporting ? "جارٍ التصدير..." : "تصدير بياناتي"}
          </button>
        </Card>
        <Card className="border-red-300">
          <h2 className="font-semibold mb-2 text-red-700">حذف الحساب</h2>
          <p className="text-sm text-gray-500 mb-3">
            سيتم حذف حسابك وجميع بياناتك بعد 30 يوماً. يمكنك إلغاء الطلب خلال هذه الفترة.
          </p>
          <button
            onClick={deleteAccount}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {deleting ? "..." : "طلب الحذف"}
          </button>
        </Card>
      </div>
    </PageShell>
  );
}

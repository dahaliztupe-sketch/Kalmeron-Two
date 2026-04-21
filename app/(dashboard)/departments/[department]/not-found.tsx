import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <div dir="rtl" className="max-w-xl mx-auto text-center py-20">
        <h1 className="font-display text-4xl font-extrabold text-white mb-3">القسم غير موجود</h1>
        <p className="text-text-secondary mb-6">القسم المطلوب غير معروف. تحقق من الرابط.</p>
        <Link href="/dashboard" className="inline-block bg-white text-black font-bold px-6 py-3 rounded-xl">
          العودة لمركز القيادة
        </Link>
      </div>
    </AppShell>
  );
}

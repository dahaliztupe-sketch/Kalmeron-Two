import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "بدون اتصال | كلميرون",
  description: "أنت غير متصل بالإنترنت. سنعود فور رجوع الشبكة.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      id="kalmeron-main"
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-[#0A0A0F] text-white px-6"
    >
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <CloudOff className="w-8 h-8 text-cyan-300" aria-hidden />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold mb-3">
          أنت بدون اتصال الآن
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
          لا تقلق — كلميرون يحفظ الواجهة الأساسية محلياً. ما إن تعود الشبكة،
          ستُكمل من حيث توقّفت. الرسائل المُرسَلة مؤخّراً ستُرفَع تلقائياً.
        </p>

        <div className="flex items-center justify-center gap-3">
          <a
            href="javascript:location.reload()"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-medium hover:brightness-110 transition"
          >
            <RefreshCw className="w-4 h-4" aria-hidden />
            حاول مجدّداً
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-200 hover:bg-white/[0.08] transition"
          >
            الصفحة الرئيسية
          </Link>
        </div>

        <p className="text-[11px] text-neutral-600 mt-8">
          الجلسة الحالية محفوظة محلياً، وأي إجراء جديد سيُحاول الإرسال تلقائياً عند الاتصال.
        </p>
      </div>
    </main>
  );
}

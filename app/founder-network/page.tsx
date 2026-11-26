import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مجلس المؤسّسين | كلميرون",
  description: "لا يوجد مجتمع مؤسسين قائم حالياً. فكرة مستقبلية غير مفعّلة.",
  alternates: { canonical: "/founder-network" },
  robots: { index: false, follow: false },
};

export default function FounderNetworkPage() {
  return (
    <main className="min-h-screen px-6 py-24 text-center" dir="rtl">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">مجلس المؤسّسين: غير متاح</h1>
      <p className="text-neutral-400 max-w-xl mx-auto text-lg">
        لا يوجد مجتمع أو أعضاء أو حلقات عمل حالياً. هذه فكرة مستقبلية فقط، وكلميرون مشروع تجريبي بمساعدة الذكاء الاصطناعي ومتوقف حالياً.
      </p>
    </main>
  );
}

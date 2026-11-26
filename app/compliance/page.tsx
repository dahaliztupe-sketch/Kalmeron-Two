import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الامتثال القانوني | معايير كلميرون للخصوصية والأمان",
  description: "حالة الامتثال في Kalmeron AI: مواءمة مع القانون المصري 151 بلا تدقيق مستقل، معالجة البيانات، سياسة الاحتفاظ، والتزاماتنا القانونية تجاه مستخدمينا.",
};

import { PublicShell } from "@/components/layout/PublicShell";

export default function CompliancePage() {
  return (
    <PublicShell>
      <div className="max-w-4xl mx-auto py-12 px-4" dir="rtl">
        <h1 className="text-4xl font-bold mb-8 text-[rgb(var(--brand-cyan))]">الامتثال التنظيمي (Regional Compliance)</h1>
        <p className="text-neutral-300 mb-8">نعمل على مواءمة ممارساتنا مع قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020. لم يُجرَ تدقيق امتثال مستقل بعد، ولا نحمل شهادات امتثال أو أمان.</p>
        
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
          <h2 className="text-2xl font-semibold mb-3 text-white">ما لا ندّعيه</h2>
          <p className="text-neutral-400">لا ندّعي حالياً الامتثال لمتطلبات السعودية أو الإمارات أو اللائحة الأوروبية GDPR. إن كنت تحتاج امتثالاً محدداً لجهة أو بلد، اسأل قبل الاستخدام.</p>
        </div>
      </div>
    </PublicShell>
  );
}

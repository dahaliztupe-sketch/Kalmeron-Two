import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المصادقة | كلميرون",
  description: "سجّل دخولك أو أنشئ حسابًا في كلميرون وابدأ رحلتك مع الشريك المؤسس الذكي لرواد الأعمال المصريين.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

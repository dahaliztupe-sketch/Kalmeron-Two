import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "لوحة التحكم | Kalmeron AI Studio",
  description:
    "منصة Kalmeron AI Studio لرواد الأعمال — تابع مشروعك، تحدّث مع مساعديك الذكيين، وادرس الفرص والتمويل كله في مكان واحد.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <main className="flex-1 w-full relative z-0">{children}</main>
    </AuthGuard>
  );
}

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <main className="flex-1 w-full relative z-0">{children}</main>
    </AuthGuard>
  );
}

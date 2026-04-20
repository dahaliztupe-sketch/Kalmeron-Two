import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <main className="flex-1 w-full relative z-0">{children}</main>
    </>
  );
}

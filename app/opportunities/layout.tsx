import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "رادار الفرص | كلميرون",
  description: "اكتشف الفرص التمويلية والمسابقات وفجوات السوق المناسبة لمشروعك في مصر والمنطقة.",
};

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

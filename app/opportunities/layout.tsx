import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "رادار الفرص | كلميرون",
  description: "اكتشف الفرص التمويلية والمسابقات وفجوات السوق المناسبة لمشروعك في سوقك المستهدف.",
};

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

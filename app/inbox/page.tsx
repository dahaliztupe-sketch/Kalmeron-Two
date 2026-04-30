import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "صندوق الوارد | إشعارات ومهام Kalmeron AI",
  description: "إشعاراتك ورسائل فريقك الذكي من جميع أقسام كلميرون: المالية، القانونية، التسويق، والمبيعات. تابع المهام والتحديثات الجديدة في مكان واحد.",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "وكلاء Kalmeron الذكيون | من الفكرة إلى الإمبراطورية",
  description: "استكشف 27+ وكيلاً ذكياً منظّمين في 4 مراحل: الفكرة، الإطلاق، النمو، والتوسع — فريقك الريادي الكامل يتحدث العربية ويفهم سوقك ويتكيف مع بيئتك.",
  robots: "noindex",
};

export default function Page() {
  return (<><h1 className="sr-only">الوكلاء الذكيون</h1><PageClient  /></>);
}

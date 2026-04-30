import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "النماذج القانونية",
  description: "قوالب قانونية جاهزة بالعربية والإنجليزية",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "التأسيس في مصر",
  description: "دليل تأسيس شركتك في مصر خطوة بخطوة",
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "نتائج التجربة",
  description: "تفاصيل تجارب السوق التي أجريتها",
};

interface PageProps {
  params: Promise<{ experimentId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function Page(props: PageProps) {
  return <PageClient {...props} />;
}

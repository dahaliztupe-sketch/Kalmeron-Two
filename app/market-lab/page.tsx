import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "مختبر السوق | اختبر فكرتك قبل إطلاقها",
  description: "مختبر السوق من كلميرون يساعدك في اختبار فكرتك التجارية قبل الاستثمار فيها: تحليل الطلب، بحوث المنافسين، نماذج التسعير، وردود الفعل الواقعية من السوق العربي.",
};

export default function Page() {
  return <PageClient />;
}

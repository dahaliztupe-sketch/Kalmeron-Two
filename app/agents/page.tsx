import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "مساعدو Kalmeron الذكيون | 16 خبيراً لشركتك",
  description: "استكشف 16 مساعداً ذكياً متخصصاً يعملون كفريقك: CFO افتراضي، مستشار قانوني، مدير مبيعات، محلل تسويق، رادار فرص، وأكثر — كلهم يتحدثون العربية.",
};

export default function Page() {
  return (<><h1 className="sr-only">الوكلاء الذكيون</h1><PageClient  /></>);
}

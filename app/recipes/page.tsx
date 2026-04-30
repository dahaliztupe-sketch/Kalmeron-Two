import type { Metadata } from "next";
import RecipesClient from "./_recipes-client";

export const metadata: Metadata = {
  title: "وصفات الأعمال الجاهزة | نماذج عمل قابلة للتطبيق",
  description: "مكتبة من وصفات الأعمال الجاهزة والمختبرة: لصياغة عروض القيمة، بناء نماذج الإيرادات، التخطيط للمنتج، والتسويق — كلها قابلة للتخصيص وتناسب السوق العربي.",
};

export default function Page() {
  return <RecipesClient />;
}

import type { Metadata } from "next";
import RecipesClient from "./_recipes-client";

export const metadata: Metadata = {
  title: "الوصفات الجاهزة",
  description: "وصفات عمل جاهزة وقابلة للتخصيص",
};

export default function Page() {
  return <RecipesClient />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "متحف النجاح | كلميرون",
  description: "استوحِ من قصص نجاح الشركات الناشئة المصرية والعربية الرائدة وطبّق دروسها على مشروعك.",
};

export default function SuccessMuseumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

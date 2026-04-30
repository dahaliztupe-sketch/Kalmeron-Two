import type { Metadata } from "next";
import PublicRunwayPage from "./_client";

export const metadata: Metadata = {
  title: "حاسبة Runway مجانية للشركات الناشئة المصرية | كلميرون",
  description:
    "احسب خلال ثوانٍ كم شهراً يبقى فيها رصيدك قبل النفاد، واحصل على ٣ توصيات عملية فوراً. أداة مجانية بدون تسجيل من كلميرون — للمؤسّسين المصريّين.",
  alternates: { canonical: "/free-tools/cash-runway" },
  openGraph: {
    title: "حاسبة Cash Runway مجانية — كلميرون",
    description:
      "اعرف كم شهراً يكفي رصيدك واحصل على توصيات فورية لإطالة المدّة.",
    locale: "ar_EG",
    type: "website",
  },
};

export default function Page() {
  return <PublicRunwayPage />;
}

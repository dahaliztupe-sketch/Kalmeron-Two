export const LEGAL_KNOWLEDGE = {
  startupCharter: {
    definition: "شركة حديثة التأسيس، مبتكرة، ذات نمو متسارع، وتعتمد على التكنولوجيا أو ملكية فكرية واضحة.",
    classificationPaths: ["جهاز تنمية المشروعات (PATH-1: سريع 5 أيام للمرشحين)", "جهاز تنمية المشروعات (PATH-2: عادي أسبوعان)"],
    validityPeriod: "سارية لـ 3 سنوات، تجدد كل سنتين حتى 7 سنوات على التأسيس.",
    targets: { enabledStartups: 5000, jobCreation: 500000, investmentValue: "5 billion USD" }
  },
  taxLaw6_2025: {
    applicability: "حجم أعمال سنوي لا يتجاوز 20 مليون جنيه.",
    taxBrackets: [
        { upTo: "500k", rate: "0.4%" },
        { upTo: "10m-20m", rate: "1.5%" }
    ],
    exemptions: ["رسوم الدمغة", "رسوم التوثيق والشهر للعقود"]
  },
  dataProtectionLaw151: {
    keyRights: ["الحق في الوصول", "الحق في التصحيح", "الحق في المحو"],
    controllerObligations: ["حماية بيانات المستخدم"]
  }
};

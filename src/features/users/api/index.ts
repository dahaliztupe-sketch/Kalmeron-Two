// @ts-nocheck
export async function getUserData() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    name: "رائد الأعمال",
    stage: "مرحلة النمو",
    recentActivity: ["تم توليد نموذج NDA", "تم تحليل فكرة جديدة", "تم تقييم السوق بنجاح"],
  };
}

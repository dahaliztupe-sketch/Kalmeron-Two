import { Suspense } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { getProactiveWarnings } from "@/src/agents/mistake-shield/agent";
import { getUserData } from "@/src/features/users/api";
import { BentoGrid, BentoCard } from "@/src/components/ui/BentoGrid";
import { Lightbulb, Target, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

async function safeGetInsight(): Promise<string> {
  try {
    const insight = await getProactiveWarnings("general");
    return insight || "احرص دائمًا على توثيق مستنداتك القانونية بشكل مسبق.";
  } catch {
    return "احرص دائمًا على توثيق مستنداتك القانونية بشكل مسبق.";
  }
}

async function DashboardContent() {
  const [userData, initialInsight] = await Promise.all([
    getUserData(),
    safeGetInsight(),
  ]);

  return (
    <BentoGrid>
      <BentoCard span={2} className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-white">مرحباً بعودتك، {userData.name}</h2>
        <p className="text-neutral-400 mb-6">
          متتبع المراحل: <span className="text-[#D4AF37]">{userData.stage}</span>
        </p>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#0A66C2] w-[60%]" />
        </div>
      </BentoCard>

      <BentoCard span={1} className="p-6 flex flex-col justify-center items-center text-center">
        <div className="p-4 rounded-full bg-rose-500/10 mb-4">
          <Lightbulb className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">رؤية اليوم</h3>
        <p className="text-sm text-neutral-400 line-clamp-3">{initialInsight}</p>
      </BentoCard>

      <BentoCard span={1} className="p-6 flex flex-col justify-center items-center text-center">
        <div className="p-4 rounded-full bg-green-500/10 mb-4">
          <Target className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">أقرب فرصة</h3>
        <p className="text-sm text-neutral-400">انضمام لبرنامج احتضان مسرعة (X) خلال أسبوعين.</p>
      </BentoCard>

      <BentoCard span={2} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-[#0A66C2]" />
          <h3 className="text-xl font-bold text-white">نشاطك الأخير</h3>
        </div>
        <ul className="space-y-4">
          {userData.recentActivity.map((activity: string, i: number) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#0A66C2]" />
              <span className="text-neutral-300">{activity}</span>
            </li>
          ))}
        </ul>
      </BentoCard>
    </BentoGrid>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <Skeleton className="col-span-2 h-48 rounded-3xl bg-white/5" />
      <Skeleton className="col-span-1 h-48 rounded-3xl bg-white/5" />
      <Skeleton className="col-span-1 h-48 rounded-3xl bg-white/5" />
      <Skeleton className="col-span-2 h-48 rounded-3xl bg-white/5" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[rgb(var(--background))] text-white" dir="rtl">
      <Sidebar />
      <main className="flex-1 mr-64 p-8 relative">
        <h1 className="text-4xl font-bold mb-8">لوحة التحكم</h1>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}

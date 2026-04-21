import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#0A0A0F]" dir="rtl">
      <aside className="w-64 border-l border-white/10 p-6 space-y-4 hidden md:block">
        <Skeleton className="h-10 w-32 rounded-xl bg-white/5" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/5" />
        ))}
      </aside>
      <main className="flex-1 p-8 space-y-8">
        <Skeleton className="h-10 w-48 rounded-xl bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-48 rounded-3xl bg-white/5" />
          <Skeleton className="h-48 rounded-3xl bg-white/5" />
          <Skeleton className="h-48 rounded-3xl bg-white/5" />
          <Skeleton className="md:col-span-2 h-48 rounded-3xl bg-white/5" />
        </div>
      </main>
    </div>
  );
}

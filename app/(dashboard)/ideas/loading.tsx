import { Skeleton } from "@/components/ui/skeleton";

export default function IdeasLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] p-8" dir="rtl">
      <Skeleton className="h-10 w-64 rounded-xl bg-white/5 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-3xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

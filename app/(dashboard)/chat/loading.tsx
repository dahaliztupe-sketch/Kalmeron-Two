import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex min-h-screen bg-[#0A0A0F]" dir="rtl">
      <aside className="w-64 border-l border-white/10 p-6 space-y-4 hidden md:block">
        <Skeleton className="h-10 w-32 rounded-xl bg-white/5" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/5" />
        ))}
      </aside>
      <main className="flex-1 flex flex-col p-6 gap-4">
        <Skeleton className="h-8 w-48 rounded-xl bg-white/5" />
        <div className="flex-1 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className={`h-16 rounded-2xl bg-white/5 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
            </div>
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
      </main>
    </div>
  );
}

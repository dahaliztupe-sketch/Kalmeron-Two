import { Skeleton } from "@/components/ui/page-shell";
export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-80 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

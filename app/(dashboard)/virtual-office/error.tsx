"use client";
import { ErrorBlock } from "@/components/ui/page-shell";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ErrorBlock error={error.message || "حدث خطأ غير متوقع"} retry={reset} />
    </div>
  );
}

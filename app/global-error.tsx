"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertOctagon className="w-12 h-12 text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">المنصة تواجه مشكلة</h1>
            <p className="text-neutral-400 text-lg">
              حدث خطأ حرج في النظام. فريقنا التقني يعمل على إصلاحه.
            </p>
            {error.digest && (
              <p className="text-neutral-600 text-sm font-mono">Digest: {error.digest}</p>
            )}
          </div>
          <Button
            onClick={reset}
            className="bg-[rgb(var(--gold))] text-black hover:bg-[#d9a31a] font-bold rounded-xl px-8 py-3 text-lg"
          >
            محاولة مرة أخرى
          </Button>
        </div>
      </body>
    </html>
  );
}

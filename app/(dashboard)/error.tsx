"use client";

import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6" dir="rtl">
      <div className="glass border border-red-500/20 rounded-[2.5rem] p-12 max-w-lg w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">حدث خطأ غير متوقع</h2>
          <p className="text-neutral-400">
            واجهنا مشكلة في تحميل هذه الصفحة. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
          </p>
          {error.digest && (
            <p className="text-neutral-600 text-xs font-mono">كود الخطأ: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2 bg-[rgb(var(--brand-cyan))] text-black hover:bg-[#d9a31a] font-bold rounded-xl"
          >
            <RefreshCcw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex items-center gap-2 border-white/20 text-white hover:bg-white/5 rounded-xl"
            )}
          >
            <Home className="w-4 h-4" />
            لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}

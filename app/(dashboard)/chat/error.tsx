"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircleX, RefreshCcw } from "lucide-react";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Chat error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6" dir="rtl">
      <div className="glass border border-red-500/20 rounded-[2.5rem] p-12 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <MessageCircleX className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">واجهنا مشكلة في المحادثة</h2>
          <p className="text-neutral-400">
            حدث خطأ أثناء تحميل المحادثة. حاول مرة أخرى أو ابدأ محادثة جديدة.
          </p>
        </div>
        <Button
          onClick={reset}
          className="flex items-center gap-2 bg-[rgb(var(--brand-cyan))] text-black hover:bg-[#d9a31a] font-bold rounded-xl mx-auto"
        >
          <RefreshCcw className="w-4 h-4" />
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}

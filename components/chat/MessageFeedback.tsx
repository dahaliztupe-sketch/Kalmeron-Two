"use client";

/**
 * MessageFeedback — مكوّن تقييم رد المساعد (👍 / 👎) بنمط ChatGPT و Claude.
 *
 * يحفظ التقييم في Firestore عبر `/api/chat/feedback` ويسمح للمستخدم بإضافة
 * سبب اختياري عند الضغط على 👎 لتحسين النموذج لاحقاً (rateResponse).
 */

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

export type MessageRating = "up" | "down" | null;

interface MessageFeedbackProps {
  messageId: string;
  conversationId?: string;
  content: string;
  onRegenerate?: () => void;
  initialRating?: MessageRating;
}

export function MessageFeedback({
  messageId,
  conversationId,
  content,
  onRegenerate,
  initialRating = null,
}: MessageFeedbackProps) {
  const [rating, setRating] = useState<MessageRating>(initialRating);
  const [copied, setCopied] = useState(false);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  async function rateResponse(value: "up" | "down", reasonText?: string) {
    setRating(value);
    if (value === "down" && !reasonText) {
      setShowReasonBox(true);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/chat/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId,
            conversationId,
            messageRating: value,
            reason: reasonText || null,
          }),
        });
        if (!res.ok) throw new Error("failed");
        toast.success(value === "up" ? "شكراً على تقييمك الإيجابي" : "شكراً، سنعمل على تحسين الرد");
        setShowReasonBox(false);
        setReason("");
      } catch {
        toast.error("تعذّر إرسال التقييم");
        setRating(initialRating);
      }
    });
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("تعذّر نسخ النص");
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", rating === "up" && "text-emerald-600 bg-emerald-50 dark:bg-emerald-950")}
          onClick={() => rateResponse("up")}
          disabled={isPending}
          aria-label="إعجاب بالرد"
          aria-pressed={rating === "up"}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">إعجاب</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", rating === "down" && "text-rose-600 bg-rose-50 dark:bg-rose-950")}
          onClick={() => rateResponse("down")}
          disabled={isPending}
          aria-label="عدم إعجاب بالرد"
          aria-pressed={rating === "down"}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">عدم إعجاب</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={copyToClipboard}
          aria-label="نسخ الرد"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          <span className="sr-only">{copied ? "تم النسخ" : "نسخ"}</span>
        </Button>
        {onRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onRegenerate}
            aria-label="إعادة توليد الرد"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">إعادة توليد</span>
          </Button>
        )}
      </div>

      {showReasonBox && (
        <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
          <label htmlFor={`reason-${messageId}`} className="mb-2 block text-xs font-medium text-rose-700 dark:text-rose-300">
            ما الذي لم يعجبك في هذا الرد؟ (اختياري)
          </label>
          <textarea
            id={`reason-${messageId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="معلومة غير دقيقة، إجابة غير مفيدة، أو خارج السياق…"
            className="w-full rounded-md border border-rose-200 bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-900"
            rows={2}
            aria-label="سبب عدم الإعجاب"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowReasonBox(false); setRating(initialRating); }}>
              إلغاء
            </Button>
            <Button size="sm" onClick={() => rateResponse("down", reason || "no_reason")} disabled={isPending}>
              إرسال
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

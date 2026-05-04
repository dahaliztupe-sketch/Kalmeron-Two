"use client";

import { cn } from "@/src/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/[0.04]",
        className
      )}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-8" aria-busy="true" aria-label="جارٍ التحميل">
      {/* Header */}
      <div className="space-y-3">
        <Bone className="h-5 w-28 rounded-full" />
        <Bone className="h-9 w-64" />
        <Bone className="h-4 w-96 max-w-full" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 space-y-3">
            <Bone className="h-4 w-24" />
            <Bone className="h-8 w-16" />
            <Bone className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Bone className="h-5 w-40" />
          <Bone className="h-8 w-24 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>

      {/* Secondary card */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 space-y-3">
        <Bone className="h-5 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 space-y-2">
              <Bone className="h-10 w-10 rounded-xl" />
              <Bone className="h-4 w-24" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 space-y-3">
      <Bone className="h-5 w-40" />
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Bone key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[true, false, true, false].map((isUser, i) => (
        <div key={i} className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
          <Bone className="w-8 h-8 rounded-full shrink-0" />
          <div className={cn("space-y-2 max-w-[70%]", isUser ? "items-end" : "items-start")}>
            <Bone className={cn("h-4", isUser ? "w-20" : "w-28")} />
            <Bone className={cn("h-16 rounded-2xl", isUser ? "w-48" : "w-72")} />
          </div>
        </div>
      ))}
    </div>
  );
}

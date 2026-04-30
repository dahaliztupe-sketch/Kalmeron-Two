"use client";

import { useEffect } from "react";

/**
 * Error boundary for the /api segment. Next.js doesn't render JSX for
 * pure JSON route handlers, but the App Router still requires an error.tsx
 * sibling for any segment that may render UI (e.g. nested HTML routes).
 * We render a minimal Arabic-first fallback so users always see a clear
 * recovery action instead of the framework default.
 */
export default function ApiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[api] segment error", error);
    }
  }, [error]);

  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#04060B] text-[#F8FAFC]"
    >
      <h2 className="text-2xl font-bold">حدث خطأ غير متوقع</h2>
      <p className="text-white/70 max-w-md">
        تعذّر إكمال الطلب الحالي. حاول مجدداً، وإن استمرت المشكلة تواصل مع فريق الدعم.
      </p>
      {error?.digest ? (
        <p className="text-xs text-white/40">معرّف الخطأ: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        aria-label="حاول مجدداً"
        className="mt-2 inline-flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        حاول مجدداً
      </button>
    </div>
  );
}

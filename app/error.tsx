'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-rose-500/20 bg-rose-950/20 p-6 text-center">
        <h1 className="text-xl font-bold text-rose-200 mb-2">حدث خطأ غير متوقّع</h1>
        <p className="text-sm text-rose-300/80 mb-4">
          نأسف على الإزعاج. تمّ تسجيل المشكلة تلقائياً وسنعالجها.
        </p>
        {error?.digest && (
          <p className="text-[11px] text-rose-300/60 mb-4 font-mono">
            رمز التتبّع: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition"
          >
            حاول مرّة أخرى
          </button>
          <a
            href="/"
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-medium transition"
          >
            العودة للرئيسيّة
          </a>
        </div>
      </div>
    </div>
  );
}

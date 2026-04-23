"use client";
import { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" tabIndex={-1}>
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border rounded-lg p-4 bg-white dark:bg-gray-900 ${className}`}>
      {children}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} aria-hidden />;
}

export function EmptyState({
  title,
  hint,
  icon = "✨",
}: {
  title: string;
  hint?: string;
  icon?: string;
}) {
  return (
    <div className="p-8 text-center text-gray-500" role="status">
      <div className="text-3xl mb-2" aria-hidden>{icon}</div>
      <div className="font-medium">{title}</div>
      {hint && <div className="text-xs mt-1">{hint}</div>}
    </div>
  );
}

export function ErrorBlock({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div role="alert" className="border border-red-300 rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
      <div className="font-semibold text-red-700 dark:text-red-300">حدث خطأ</div>
      <div className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</div>
      {retry && (
        <button
          onClick={retry}
          className="mt-3 px-3 py-1 text-sm rounded bg-red-600 text-white"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

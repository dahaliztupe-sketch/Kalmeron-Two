/**
 * Loading state for nested UI within app/api/dashboard. The /api segment
 * is primarily a JSON surface, but Next.js will still render this skeleton
 * if any nested route ever returns React UI. Keeping it minimal avoids
 * shipping JS to plain JSON callers.
 */
export default function ApiDashboardLoading() {
  return (
    <div
      dir="rtl"
      lang="ar"
      role="status"
      aria-label="جارٍ تحميل بيانات لوحة التحكم"
      className="p-6 text-sm text-white/60"
    >
      <span className="sr-only">جارٍ التحميل…</span>
      <div className="h-3 w-40 rounded bg-white/[0.06] animate-pulse" />
    </div>
  );
}

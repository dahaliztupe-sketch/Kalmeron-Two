/**
 * Skeleton loader for the dashboard route. Replaces the white flash that
 * Next.js shows by default while the page chunk + Firestore subscription
 * are still warming up.
 */
export default function DashboardLoading() {
  return (
    <div
      dir="rtl"
      lang="ar"
      aria-label="جارٍ تحميل لوحة التحكم"
      role="status"
      className="min-h-screen bg-[#04060B] text-[#F8FAFC] p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-md bg-white/[0.06]" />
            <div className="h-3 w-72 rounded-md bg-white/[0.04]" />
          </div>
          <div className="h-10 w-28 rounded-md bg-white/[0.06]" />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
            >
              <div className="h-3 w-24 rounded bg-white/[0.05]" />
              <div className="mt-3 h-6 w-16 rounded bg-white/[0.07]" />
              <div className="mt-3 h-2 w-32 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>

        {/* main panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 rounded-2xl border border-white/5 bg-white/[0.03]" />
          <div className="h-72 rounded-2xl border border-white/5 bg-white/[0.03]" />
        </div>
      </div>
      <span className="sr-only">جارٍ التحميل…</span>
    </div>
  );
}

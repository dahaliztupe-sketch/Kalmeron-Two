"use client";

/**
 * UsageClient — لوحة استخدام تفصيلية بنمط OpenAI Platform Dashboard.
 *
 * تعرض:
 * - استهلاك الاعتمادات اليومي (chart)
 * - تكلفة شهرية تقديرية
 * - عدد الطلبات لكل وكيل
 * - infinite scroll لسجل الطلبات (BENCH-LINEAR-LOAD-MORE)
 */

import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Coins, Activity, Cpu } from "lucide-react";

interface UsageSummary {
  creditsUsed: number;
  creditsRemaining: number;
  requestsThisMonth: number;
  estimatedCostUsd: number;
  byAgent: Array<{ agent: string; requests: number; cost: number }>;
  daily: Array<{ date: string; requests: number; credits: number }>;
}

interface UsageEvent {
  id: string;
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  createdAt: string;
}

interface UsagePage {
  events: UsageEvent[];
  nextCursor: string | null;
}

async function fetchSummary(token: string): Promise<UsageSummary> {
  const res = await fetch("/api/billing/usage/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("failed");
  return res.json();
}

async function fetchEvents(token: string, cursor?: string): Promise<UsagePage> {
  const url = new URL("/api/billing/usage/events", window.location.origin);
  url.searchParams.set("limit", "20");
  if (cursor) url.searchParams.set("cursor", cursor);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export default function UsageClient() {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["usage-summary", user?.uid],
    queryFn: async () => {
      if (!user) throw new Error("no_user");
      const token = await user.getIdToken();
      return fetchSummary(token);
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  // BENCH-LINEAR-LOAD-MORE: cursor-based pagination مع useInfiniteQuery
  const eventsQuery = useInfiniteQuery({
    queryKey: ["usage-events", user?.uid],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      if (!user) throw new Error("no_user");
      const token = await user.getIdToken();
      return fetchEvents(token, pageParam);
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!user,
  });

  const allEvents = useMemo(
    () => eventsQuery.data?.pages.flatMap((p) => p.events) ?? [],
    [eventsQuery.data],
  );

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">لوحة الاستخدام</h1>
        <p className="text-muted-foreground">يرجى تسجيل الدخول لعرض استهلاكك.</p>
      </main>
    );
  }

  const s = summaryQuery.data;

  return (
    <main dir="rtl" className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">لوحة الاستخدام</h1>
        <p className="mt-1 text-muted-foreground">تابع استهلاكك من نقاط الذكاء الاصطناعي والتكاليف الشهرية.</p>
      </header>

      {summaryQuery.isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground" role="status" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>جاري تحميل البيانات…</span>
        </div>
      )}

      {s && (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="ملخص الاستخدام">
            <StatCard icon={Coins} label="اعتمادات مستخدمة" value={s.creditsUsed.toLocaleString("ar-EG")} hint={`${s.creditsRemaining.toLocaleString("ar-EG")} متبقية`} />
            <StatCard icon={Activity} label="طلبات هذا الشهر" value={s.requestsThisMonth.toLocaleString("ar-EG")} />
            <StatCard icon={TrendingUp} label="تكلفة تقديرية" value={`$${s.estimatedCostUsd.toFixed(2)}`} hint="بالدولار" />
            <StatCard icon={Cpu} label="عدد الوكلاء النشطين" value={String(s.byAgent.length)} />
          </section>

          <section className="mb-8" aria-label="استخدام اليومي">
            <Card>
              <CardHeader><CardTitle>الاستخدام اليومي (آخر 30 يوم)</CardTitle></CardHeader>
              <CardContent>
                <div className="flex h-32 items-end gap-1">
                  {s.daily.slice(-30).map((d) => {
                    const max = Math.max(...s.daily.map((x) => x.credits), 1);
                    const h = Math.max(4, (d.credits / max) * 100);
                    return (
                      <div
                        key={d.date}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                        style={{ height: `${h}%` }}
                        title={`${d.date}: ${d.credits} اعتماد، ${d.requests} طلب`}
                        aria-label={`${d.date}: ${d.credits} اعتماد`}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-8" aria-label="استخدام لكل وكيل">
            <Card>
              <CardHeader><CardTitle>الاستخدام حسب الوكيل</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2 text-right">الوكيل</th>
                      <th className="py-2 text-right">عدد الطلبات</th>
                      <th className="py-2 text-right">التكلفة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.byAgent.map((a) => (
                      <tr key={a.agent} className="border-b last:border-0">
                        <td className="py-2 font-medium">{a.agent}</td>
                        <td className="py-2">{a.requests.toLocaleString("ar-EG")}</td>
                        <td className="py-2">${a.cost.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>
        </>
      )}

      <section aria-label="سجل الطلبات">
        <Card>
          <CardHeader><CardTitle>سجل الطلبات</CardTitle></CardHeader>
          <CardContent>
            {eventsQuery.isLoading && (
              <div className="text-muted-foreground">جاري تحميل السجل…</div>
            )}
            {allEvents.length === 0 && !eventsQuery.isLoading && (
              <div className="text-muted-foreground">لا توجد طلبات بعد.</div>
            )}
            <ul className="divide-y">
              {allEvents.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{ev.agent} <span className="text-xs text-muted-foreground">({ev.model})</span></div>
                    <div className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString("ar-EG")}</div>
                  </div>
                  <div className="text-left">
                    <div>{ev.inputTokens + ev.outputTokens} توكن</div>
                    <div className="text-xs text-muted-foreground">${ev.costUsd.toFixed(4)}</div>
                  </div>
                </li>
              ))}
            </ul>
            {eventsQuery.hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => eventsQuery.fetchNextPage()}
                  disabled={eventsQuery.isFetchingNextPage}
                >
                  {eventsQuery.isFetchingNextPage ? (
                    <><Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" /> جاري التحميل…</>
                  ) : (
                    "تحميل المزيد"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden={true} />
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

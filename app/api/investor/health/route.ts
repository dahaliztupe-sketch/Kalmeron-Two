import { NextResponse } from "next/server";
import {
  DEMO_SIDECARS,
  DEMO_ENV_REQUIREMENTS,
} from "@/src/lib/investor/demo-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SidecarStatus {
  name: string;
  role: string;
  url: string;
  critical: boolean;
  ok: boolean;
  latencyMs: number | null;
  detail?: string;
}

interface EnvStatus {
  key: string;
  label: string;
  critical: boolean;
  set: boolean;
}

async function probe(url: string, timeoutMs = 2500): Promise<{ ok: boolean; latencyMs: number | null; detail?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    const latencyMs = Date.now() - start;
    if (!res.ok) return { ok: false, latencyMs, detail: `HTTP ${res.status}` };
    return { ok: true, latencyMs };
  } catch (err) {
    return {
      ok: false,
      latencyMs: null,
      detail: err instanceof Error ? err.message : "غير معروف",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const sidecarResults: SidecarStatus[] = await Promise.all(
    DEMO_SIDECARS.map(async (s) => {
      const r = await probe(s.url);
      return { ...s, ...r };
    }),
  );

  const envResults: EnvStatus[] = DEMO_ENV_REQUIREMENTS.map((e) => ({
    key: e.key,
    label: e.label,
    critical: e.critical,
    set: Boolean(process.env[e.key] && process.env[e.key]!.length > 0),
  }));

  const criticalSidecarFailures = sidecarResults.filter((s) => s.critical && !s.ok).length;
  const criticalEnvMissing = envResults.filter((e) => e.critical && !e.set).length;
  const allReady = criticalSidecarFailures === 0 && criticalEnvMissing === 0;

  const score =
    Math.round(
      (sidecarResults.filter((s) => s.ok).length / sidecarResults.length +
        envResults.filter((e) => e.set).length / envResults.length) *
        50,
    );

  return NextResponse.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      readyForDemo: allReady,
      readinessScore: score,
      sidecars: sidecarResults,
      environment: envResults,
      summary: {
        sidecarsTotal: sidecarResults.length,
        sidecarsHealthy: sidecarResults.filter((s) => s.ok).length,
        envTotal: envResults.length,
        envSet: envResults.filter((e) => e.set).length,
        criticalSidecarFailures,
        criticalEnvMissing,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

import { NextResponse } from "next/server";
import {
  DEMO_PATH,
  DEMO_SIDECARS,
  PLATFORM_FACTS,
} from "@/src/lib/investor/demo-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only investor metrics endpoint.
 * Returns platform-level facts (no per-user data, no PII).
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      platform: PLATFORM_FACTS,
      demoPath: DEMO_PATH.map((a) => ({
        slug: a.slug,
        displayNameAr: a.displayNameAr,
        pitchAr: a.pitchAr,
        readiness: a.readiness,
        order: a.order,
        href: a.href,
      })),
      sidecars: DEMO_SIDECARS.map((s) => ({
        name: s.name,
        role: s.role,
        critical: s.critical,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

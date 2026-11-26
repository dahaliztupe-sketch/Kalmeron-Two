"use client";
import type { ReactNode } from "react";

const BASIS_AR: Record<string, string> = { assumption: "افتراض", user_fact: "من المستخدم", needs_check: "يحتاج تحقق" };

function Val({ v }: { v: unknown }): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-neutral-600">-</span>;
  if (typeof v === "string") return <span>{BASIS_AR[v] ?? v}</span>;
  if (typeof v === "number" || typeof v === "boolean") return <span>{String(v)}</span>;
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-neutral-600">-</span>;
    return (
      <ul className="list-disc pr-5 space-y-1">
        {v.map((x, i) => (
          <li key={i}>
            <Val v={x} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof v === "object") {
    return (
      <dl className="space-y-1">
        {Object.entries(v as Record<string, unknown>).map(([k, x]) => (
          <div key={k}>
            <dt className="inline text-xs text-neutral-500" dir="ltr">{k}: </dt>
            <dd className="inline"><Val v={x} /></dd>
          </div>
        ))}
      </dl>
    );
  }
  return null;
}

/** Generic read-only view of any role output. Field names are shown as the schema keys. */
export function RoleOutputView({ output }: { output: unknown }) {
  if (!output || typeof output !== "object") return null;
  return (
    <div className="space-y-3 text-sm text-neutral-200">
      {Object.entries(output as Record<string, unknown>).map(([k, v]) => (
        <section key={k} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <h5 className="text-xs font-semibold text-cyan-300 mb-1" dir="ltr">{k}</h5>
          <Val v={v} />
        </section>
      ))}
    </div>
  );
}

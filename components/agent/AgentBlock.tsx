"use client";

/**
 * Kalmeron <AgentBlock> — Generative-UI primitive
 * -----------------------------------------------
 * Single canonical renderer for AI-streamed structured output.
 * Replaces ad-hoc bubble layouts across Chat / Dashboard / Reports.
 *
 * Supported variants (per DESIGN_LANGUAGE_PLAN §6):
 *   - "stat"      : KPI tile (label + big number + optional delta)
 *   - "list"      : ordered or bulleted action list
 *   - "table"     : compact data table (headers + rows)
 *   - "callout"   : highlighted insight (info/warn/success/danger)
 *   - "milestone" : timeline-style milestone with date + status
 *
 * Wave-6 additions (audit follow-up — visual breadth for agentic UI):
 *   - "chart"     : area / bar via the Kalmeron chart kit
 *   - "form"      : interactive form, returns values via `onFormSubmit`
 *   - "checklist" : interactive todo list with local toggle state
 *   - "timeline"  : vertical event log with toned dots
 *
 * Validation: a tiny built-in shape guard (no zod dep — shapes stay tiny &
 * tree-shakeable). Invalid blocks render an "unknown block" placeholder
 * instead of crashing the surrounding stream.
 */

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { ArrowUp, ArrowDown, Info, AlertTriangle, CheckCircle2, XCircle, Circle, Check } from "lucide-react";
import { formatCurrency, formatCompactNumber, type CurrencyCode } from "@/src/lib/format/currency";
import { KalmeronAreaChart, KalmeronBarChart } from "@/src/components/charts";

// ─────────────── Shapes ───────────────
export type AgentBlockTone = "info" | "warn" | "success" | "danger" | "neutral";

export interface StatBlockData {
  type: "stat";
  label: string;
  value: number | string;
  /** Render value as a currency. Mutually exclusive with `compact`. */
  currency?: CurrencyCode;
  /** Render value as compact number (e.g. 1.2K). */
  compact?: boolean;
  /** Optional delta percentage (e.g. +12, -3.4) */
  deltaPct?: number;
  hint?: string;
}

export interface ListBlockData {
  type: "list";
  ordered?: boolean;
  items: string[];
  title?: string;
}

export interface TableBlockData {
  type: "table";
  title?: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface CalloutBlockData {
  type: "callout";
  tone: AgentBlockTone;
  title: string;
  body: string;
}

export interface MilestoneBlockData {
  type: "milestone";
  title: string;
  steps: { label: string; status: "done" | "active" | "pending"; date?: string }[];
}

// ─── Wave-6 block shapes ───
export interface ChartBlockData {
  type: "chart";
  variant: "area" | "bar";
  title?: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: string[];
}

export interface FormBlockData {
  type: "form";
  title?: string;
  fields: Array<{
    name: string;
    label: string;
    kind: "text" | "number" | "select" | "textarea";
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }>;
  submitLabel?: string;
}

export interface ChecklistBlockData {
  type: "checklist";
  title?: string;
  items: Array<{ label: string; done?: boolean }>;
}

export interface TimelineBlockData {
  type: "timeline";
  title?: string;
  events: Array<{ when: string; title: string; body?: string; tone?: AgentBlockTone }>;
}

export type AgentBlockData =
  | StatBlockData
  | ListBlockData
  | TableBlockData
  | CalloutBlockData
  | MilestoneBlockData
  | ChartBlockData
  | FormBlockData
  | ChecklistBlockData
  | TimelineBlockData;

// ─────────────── Guards ───────────────
function isValid(input: unknown): input is AgentBlockData {
  if (!input || typeof input !== "object") return false;
  const block = input as Record<string, unknown>;
  switch (block.type) {
    case "stat":
      return typeof block.label === "string" && (typeof block.value === "number" || typeof block.value === "string");
    case "list":
      return Array.isArray(block.items) && (block.items as unknown[]).every((s) => typeof s === "string");
    case "table":
      return Array.isArray(block.headers) && Array.isArray(block.rows);
    case "callout":
      return typeof block.title === "string" && typeof block.body === "string";
    case "milestone":
      return typeof block.title === "string" && Array.isArray(block.steps);
    case "chart":
      return (
        (block.variant === "area" || block.variant === "bar") &&
        typeof block.xKey === "string" &&
        Array.isArray(block.yKeys) && (block.yKeys as unknown[]).length > 0 &&
        Array.isArray(block.data)
      );
    case "form":
      return Array.isArray(block.fields) && (block.fields as unknown[]).every((raw) => {
        const f = raw as Record<string, unknown>;
        return typeof f?.name === "string" && typeof f?.label === "string" &&
          ["text", "number", "select", "textarea"].includes(f?.kind as string);
      });
    case "checklist":
      return Array.isArray(block.items) && (block.items as unknown[]).every((raw) => {
        const i = raw as Record<string, unknown>;
        return typeof i?.label === "string";
      });
    case "timeline":
      return Array.isArray(block.events) && (block.events as unknown[]).every((raw) => {
        const e = raw as Record<string, unknown>;
        return typeof e?.when === "string" && typeof e?.title === "string";
      });
    default:
      return false;
  }
}

// ─────────────── Sub-renderers ───────────────
const TONE_STYLES: Record<AgentBlockTone, { ring: string; icon: string; bg: string; Icon: React.ComponentType<{ className?: string }> }> = {
  info:    { ring: "border-cyan-400/30",    icon: "text-cyan-300",    bg: "bg-cyan-500/[0.06]",    Icon: Info },
  warn:    { ring: "border-amber-400/30",   icon: "text-amber-300",   bg: "bg-amber-500/[0.06]",   Icon: AlertTriangle },
  success: { ring: "border-emerald-400/30", icon: "text-emerald-300", bg: "bg-emerald-500/[0.06]", Icon: CheckCircle2 },
  danger:  { ring: "border-rose-400/30",    icon: "text-rose-300",    bg: "bg-rose-500/[0.06]",    Icon: XCircle },
  neutral: { ring: "border-white/10",       icon: "text-neutral-400", bg: "bg-white/[0.04]",       Icon: Circle },
};

function StatRenderer({ data, locale }: { data: StatBlockData; locale: "ar" | "en" }) {
  const value = typeof data.value === "number"
    ? data.currency
      ? formatCurrency(data.value, { currency: data.currency, locale })
      : data.compact
        ? formatCompactNumber(data.value, locale)
        : new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(data.value)
    : data.value;

  const deltaUp = (data.deltaPct ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">{data.label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-extrabold text-white tabular">{value}</span>
        {typeof data.deltaPct === "number" && Number.isFinite(data.deltaPct) && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-1.5 py-0.5",
            deltaUp ? "text-emerald-300 bg-emerald-500/10" : "text-rose-300 bg-rose-500/10",
          )}>
            {deltaUp ? <ArrowUp className="w-3 h-3" aria-hidden /> : <ArrowDown className="w-3 h-3" aria-hidden />}
            {Math.abs(data.deltaPct).toFixed(1)}%
          </span>
        )}
      </div>
      {data.hint && <p className="text-xs text-neutral-500 mt-1.5">{data.hint}</p>}
    </div>
  );
}

function ListRenderer({ data }: { data: ListBlockData }) {
  const Tag = data.ordered ? "ol" : "ul";
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      {data.title && <h4 className="text-sm font-bold text-white mb-2.5">{data.title}</h4>}
      <Tag className={cn("space-y-1.5 text-sm text-neutral-300 leading-relaxed", data.ordered ? "list-decimal" : "list-disc", "ps-5")}>
        {data.items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </Tag>
    </div>
  );
}

function TableRenderer({ data }: { data: TableBlockData }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 overflow-x-auto">
      {data.title && <h4 className="text-sm font-bold text-white mb-2.5">{data.title}</h4>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {data.headers.map((h, i) => (
              <th key={i} className="text-start font-semibold text-neutral-400 text-[11px] uppercase tracking-wider pb-2 border-b border-white/5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-white/[0.04] last:border-0">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="py-2 text-neutral-200 tabular">{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutRenderer({ data }: { data: CalloutBlockData }) {
  const tone = TONE_STYLES[data.tone] ?? TONE_STYLES.neutral;
  const Icon = tone.Icon;
  return (
    <div className={cn("rounded-2xl border p-4 flex gap-3", tone.ring, tone.bg)}>
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", tone.icon)} aria-hidden />
      <div>
        <h4 className="text-sm font-bold text-white">{data.title}</h4>
        <p className="text-sm text-neutral-300 leading-relaxed mt-1">{data.body}</p>
      </div>
    </div>
  );
}

function MilestoneRenderer({ data }: { data: MilestoneBlockData }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <h4 className="text-sm font-bold text-white mb-3">{data.title}</h4>
      <ol className="space-y-2.5">
        {data.steps.map((step, i) => {
          const dotClass =
            step.status === "done" ? "bg-emerald-400" :
            step.status === "active" ? "bg-brand-cyan animate-pulse" : "bg-white/15";
          const textClass = step.status === "pending" ? "text-neutral-500" : "text-neutral-200";
          return (
            <li key={i} className="flex items-start gap-3">
              <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", dotClass)} aria-hidden />
              <div className="flex-1 flex items-baseline justify-between gap-3">
                <span className={cn("text-sm", textClass)}>{step.label}</span>
                {step.date && <span className="text-[11px] text-neutral-500 tabular shrink-0">{step.date}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─────────────── Wave-6 sub-renderers ───────────────
function ChartRenderer({ data }: { data: ChartBlockData }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      {data.title && <h4 className="text-sm font-bold text-white mb-2.5">{data.title}</h4>}
      {data.variant === "area" ? (
        <KalmeronAreaChart data={data.data} xKey={data.xKey} yKeys={data.yKeys} height={220} />
      ) : (
        <KalmeronBarChart data={data.data} xKey={data.xKey} yKeys={data.yKeys} height={220} />
      )}
    </div>
  );
}

function FormRenderer({
  data,
  locale,
  onSubmit,
}: {
  data: FormBlockData;
  locale: "ar" | "en";
  onSubmit?: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const submit = data.submitLabel ?? (locale === "ar" ? "إرسال" : "Submit");
  return (
    <form
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 space-y-3"
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(values); }}
    >
      {data.title && <h4 className="text-sm font-bold text-white mb-1">{data.title}</h4>}
      {data.fields.map((f) => (
        <div key={f.name} className="space-y-1">
          <label className="block text-xs text-neutral-400" htmlFor={`agentform-${f.name}`}>
            {f.label}{f.required && <span className="text-rose-300"> *</span>}
          </label>
          {f.kind === "select" ? (
            <select
              id={`agentform-${f.name}`}
              required={f.required}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              value={values[f.name] ?? ""}
            >
              <option value="">—</option>
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.kind === "textarea" ? (
            <textarea
              id={`agentform-${f.name}`}
              required={f.required}
              placeholder={f.placeholder}
              rows={3}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              value={values[f.name] ?? ""}
            />
          ) : (
            <input
              id={`agentform-${f.name}`}
              type={f.kind === "number" ? "number" : "text"}
              required={f.required}
              placeholder={f.placeholder}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              value={values[f.name] ?? ""}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition"
      >
        {submit}
      </button>
    </form>
  );
}

function ChecklistRenderer({ data, locale }: { data: ChecklistBlockData; locale: "ar" | "en" }) {
  const [items, setItems] = React.useState(data.items.map((i) => ({ ...i, done: !!i.done })));
  const remaining = items.filter((i) => !i.done).length;
  const remainingLabel = locale === "ar" ? `${remaining} متبقّية` : `${remaining} left`;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      {data.title && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white">{data.title}</h4>
          <span className="text-xs text-neutral-400 tabular">{remainingLabel}</span>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setItems((arr) => arr.map((x, j) => j === i ? { ...x, done: !x.done } : x))}
              aria-label={it.done ? (locale === "ar" ? "تراجع" : "Undo") : (locale === "ar" ? "تم" : "Done")}
              aria-pressed={it.done}
              className={cn(
                "mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition",
                it.done
                  ? "bg-emerald-500/30 border-emerald-400/60 text-emerald-200"
                  : "border-white/20 hover:border-cyan-400/60",
              )}
            >
              {it.done && <Check className="w-3 h-3" aria-hidden />}
            </button>
            <span className={cn("text-sm", it.done ? "text-neutral-500 line-through" : "text-neutral-300")}>
              {it.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineRenderer({ data }: { data: TimelineBlockData }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      {data.title && <h4 className="text-sm font-bold text-white mb-4">{data.title}</h4>}
      <ol className="relative space-y-4 ms-4 border-s border-white/10 ps-5">
        {data.events.map((e, i) => {
          const tone = e.tone ?? "info";
          const dotColor =
            tone === "success" ? "bg-emerald-400" :
            tone === "warn"    ? "bg-amber-400"   :
            tone === "danger"  ? "bg-rose-400"    :
            tone === "neutral" ? "bg-neutral-400" : "bg-cyan-400";
          return (
            <li key={i} className="relative">
              <span className={cn("absolute -start-[26px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0B1020]", dotColor)} aria-hidden />
              <div className="text-[11px] text-neutral-500 mb-0.5 tabular">{e.when}</div>
              <div className="text-sm text-white">{e.title}</div>
              {e.body && <div className="text-xs text-neutral-400 mt-1 leading-relaxed">{e.body}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─────────────── Public API ───────────────
export interface AgentBlockProps {
  block: AgentBlockData | unknown;
  locale?: "ar" | "en";
  className?: string;
  onFormSubmit?: (values: Record<string, string>) => void;
}

export function AgentBlock({ block, locale = "ar", className, onFormSubmit }: AgentBlockProps) {
  if (!isValid(block)) {
    return (
      <div className={cn("rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-neutral-500", className)}>
        {locale === "ar" ? "بلوك غير معروف — تم تجاهله." : "Unknown block — skipped."}
      </div>
    );
  }
  return (
    <div className={className}>
      {block.type === "stat"      && <StatRenderer data={block} locale={locale} />}
      {block.type === "list"      && <ListRenderer data={block} />}
      {block.type === "table"     && <TableRenderer data={block} />}
      {block.type === "callout"   && <CalloutRenderer data={block} />}
      {block.type === "milestone" && <MilestoneRenderer data={block} />}
      {block.type === "chart"     && <ChartRenderer data={block} />}
      {block.type === "form"      && <FormRenderer data={block} locale={locale} onSubmit={onFormSubmit} />}
      {block.type === "checklist" && <ChecklistRenderer data={block} locale={locale} />}
      {block.type === "timeline"  && <TimelineRenderer data={block} />}
    </div>
  );
}

/** Convenience: stream-friendly array renderer. */
export function AgentBlockStream({
  blocks,
  locale = "ar",
  className,
  onFormSubmit,
}: {
  blocks: unknown[];
  locale?: "ar" | "en";
  className?: string;
  onFormSubmit?: (values: Record<string, string>) => void;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {blocks.map((b, i) => (
        <AgentBlock key={i} block={b} locale={locale} onFormSubmit={onFormSubmit} />
      ))}
    </div>
  );
}

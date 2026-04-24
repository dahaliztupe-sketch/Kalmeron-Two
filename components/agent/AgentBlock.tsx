"use client";

/**
 * Kalmeron <AgentBlock> — Generative-UI primitive
 * -----------------------------------------------
 * Single canonical renderer for AI-streamed structured output.
 * Replaces ad-hoc bubble layouts across Chat / Dashboard / Reports.
 *
 * Supported variants (per DESIGN_LANGUAGE_PLAN §6):
 *   - "stat"        : KPI tile (label + big number + optional delta)
 *   - "list"        : ordered or bulleted action list
 *   - "table"       : compact data table (headers + rows)
 *   - "callout"     : highlighted insight (info/warn/success/danger)
 *   - "milestone"   : timeline-style milestone with date + status
 *
 * Validation: a tiny built-in shape guard (no zod dep — shapes stay tiny &
 * tree-shakeable). Invalid blocks render an "unknown block" placeholder
 * instead of crashing the surrounding stream.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Info, AlertTriangle, CheckCircle2, XCircle, Circle } from "lucide-react";
import { formatCurrency, formatCompactNumber, type CurrencyCode } from "@/src/lib/format/currency";

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

export type AgentBlockData =
  | StatBlockData
  | ListBlockData
  | TableBlockData
  | CalloutBlockData
  | MilestoneBlockData;

// ─────────────── Guards ───────────────
function isValid(block: any): block is AgentBlockData {
  if (!block || typeof block !== "object") return false;
  switch (block.type) {
    case "stat":
      return typeof block.label === "string" && (typeof block.value === "number" || typeof block.value === "string");
    case "list":
      return Array.isArray(block.items) && block.items.every((s: unknown) => typeof s === "string");
    case "table":
      return Array.isArray(block.headers) && Array.isArray(block.rows);
    case "callout":
      return typeof block.title === "string" && typeof block.body === "string";
    case "milestone":
      return typeof block.title === "string" && Array.isArray(block.steps);
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

// ─────────────── Public API ───────────────
export interface AgentBlockProps {
  block: AgentBlockData | unknown;
  locale?: "ar" | "en";
  className?: string;
}

export function AgentBlock({ block, locale = "ar", className }: AgentBlockProps) {
  if (!isValid(block)) {
    return (
      <div className={cn("rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-neutral-500", className)}>
        {locale === "ar" ? "بلوك غير معروف — تم تجاهله." : "Unknown block — skipped."}
      </div>
    );
  }
  return (
    <div className={className}>
      {block.type === "stat" && <StatRenderer data={block} locale={locale} />}
      {block.type === "list" && <ListRenderer data={block} />}
      {block.type === "table" && <TableRenderer data={block} />}
      {block.type === "callout" && <CalloutRenderer data={block} />}
      {block.type === "milestone" && <MilestoneRenderer data={block} />}
    </div>
  );
}

/** Convenience: stream-friendly array renderer. */
export function AgentBlockStream({
  blocks,
  locale = "ar",
  className,
}: {
  blocks: unknown[];
  locale?: "ar" | "en";
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {blocks.map((b, i) => (
        <AgentBlock key={i} block={b} locale={locale} />
      ))}
    </div>
  );
}

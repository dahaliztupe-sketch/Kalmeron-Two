"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout/AppShell";
import { auth } from "@/src/lib/firebase";
import {
  Sparkles,
  RefreshCw,
  Power,
  GitBranch,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  agentType: string;
  steps: string[];
  parameters: Record<string, string>;
  successRate: number;
  timesUsed: number;
  successes: number;
  failures: number;
  lastFailureReason: string | null;
  enabled: boolean;
  parentId: string | null;
  generation: number;
  source: "extracted" | "merged" | "refined";
  updatedAt: number | null;
  createdAt: number | null;
}

function pct(x: number) {
  return Math.round((x || 0) * 100) + "%";
}

function timeago(ts: number | null) {
  if (!ts) return "—";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function SourceBadge({ s }: { s: Skill["source"] }) {
  const t = useTranslations("LearnedSkills.source");
  const map: Record<string, string> = {
    extracted: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    merged: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    refined: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${map[s] || ""}`}
    >
      {t(s)}
    </span>
  );
}

function EvolutionTree({ skill, all }: { skill: Skill; all: Skill[] }) {
  const t = useTranslations("LearnedSkills.details");
  const ancestry: Skill[] = [];
  let cur: Skill | undefined = skill;
  const seen = new Set<string>();
  while (cur?.parentId && !seen.has(cur.parentId)) {
    seen.add(cur.parentId);
    const parent = all.find((s) => s.id === cur!.parentId);
    if (!parent) break;
    ancestry.unshift(parent);
    cur = parent;
  }
  const descendants = all.filter((s) => s.parentId === skill.id);
  const chain = [...ancestry, skill, ...descendants];

  if (chain.length === 1) {
    return <div className="text-xs text-text-secondary/70 italic">{t("noEvolution")}</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chain.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div
            className={`px-3 py-2 rounded-lg border text-xs ${
              s.id === skill.id
                ? "bg-cyan-500/15 border-cyan-400/50 text-white font-bold"
                : "bg-white/[0.03] border-white/10 text-text-secondary"
            }`}
          >
            <div className="font-semibold">{s.name}</div>
            <div className="text-[10px] text-cyan-300/70 mt-1">
              g{s.generation} · {pct(s.successRate)}
            </div>
          </div>
          {i < chain.length - 1 && <GitBranch className="w-3.5 h-3.5 text-cyan-300/50" />}
        </div>
      ))}
    </div>
  );
}

const WORKSPACE_KEY = "kalmeron.activeWorkspaceId";

export default function LearnedSkillsPage() {
  const t = useTranslations("LearnedSkills");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWorkspaceId(localStorage.getItem(WORKSPACE_KEY) || "");
    }
  }, []);

  async function load(wid: string) {
    if (!wid) {
      setSkills([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch(`/api/learned-skills?workspaceId=${encodeURIComponent(wid)}`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "load_failed");
      setSkills(json.skills || []);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(id: string, enabled: boolean) {
    if (!workspaceId) return;
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch("/api/learned-skills", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ workspaceId, id, enabled }),
      });
      if (res.ok) {
        setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "toggle_failed");
      }
    } catch (e) {
      console.warn("toggle failed", e);
    }
  }

  async function consolidate() {
    if (!workspaceId) return;
    try {
      setBusy(true);
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch("/api/learned-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ workspaceId }),
      });
      if (res.status === 403) {
        setError("forbidden_role");
      } else {
        await load(workspaceId);
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (workspaceId) load(workspaceId);
  }, [workspaceId]);

  const agents = useMemo(() => {
    const set = new Set(skills.map((s) => s.agentType));
    return ["all", ...Array.from(set).sort()];
  }, [skills]);

  const filtered = useMemo(() => {
    return filterAgent === "all" ? skills : skills.filter((s) => s.agentType === filterAgent);
  }, [skills, filterAgent]);

  const stats = useMemo(() => {
    const enabled = skills.filter((s) => s.enabled).length;
    const used = skills.reduce((sum, s) => sum + (s.timesUsed || 0), 0);
    const avgSr = skills.length
      ? skills.reduce((sum, s) => sum + (s.successRate || 0), 0) / skills.length
      : 0;
    return { total: skills.length, enabled, used, avgSr };
  }, [skills]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6 font-arabic">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </span>
              {t("title")}
            </h1>
            <p className="text-sm text-text-secondary mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(workspaceId)}
              disabled={loading || !workspaceId}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-text-secondary hover:text-white text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </button>
            <button
              onClick={consolidate}
              disabled={busy}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {t("consolidate")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t("stats.total"), value: stats.total },
            { label: t("stats.enabled"), value: stats.enabled },
            { label: t("stats.used"), value: stats.used },
            { label: t("stats.avgSuccess"), value: pct(stats.avgSr) },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4"
            >
              <div className="text-xs text-text-secondary uppercase tracking-wider">{c.label}</div>
              <div className="text-2xl font-extrabold text-white mt-1">{c.value}</div>
            </div>
          ))}
        </div>

        {agents.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {agents.map((a) => (
              <button
                key={a}
                onClick={() => setFilterAgent(a)}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  filterAgent === a
                    ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-200"
                    : "bg-white/[0.03] border-white/10 text-text-secondary hover:text-white"
                }`}
              >
                {a === "all" ? t("filters.allAgents") : a}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-text-secondary">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-10 text-center text-text-secondary">
            <Sparkles className="w-8 h-8 mx-auto opacity-50" />
            <div className="mt-3">{t("empty")}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => {
              const isOpen = expanded === s.id;
              const trend = s.successRate >= 0.7 ? "up" : "down";
              return (
                <div
                  key={s.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    s.enabled
                      ? "bg-white/[0.03] border-white/[0.06]"
                      : "bg-white/[0.01] border-white/[0.04] opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white">{s.name}</h3>
                        <SourceBadge s={s.source} />
                        <span className="text-[10px] text-text-secondary uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                          {s.agentType}
                        </span>
                        <span className="text-[10px] text-text-secondary">g{s.generation}</span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-bold text-white">
                          {trend === "up" ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          {pct(s.successRate)}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">
                          {s.timesUsed} · {timeago(s.updatedAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(s.id, !s.enabled)}
                        className={`p-2 rounded-lg border ${
                          s.enabled
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                            : "bg-white/[0.03] border-white/10 text-text-secondary"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="text-xs text-cyan-300 hover:text-cyan-200 mt-3"
                  >
                    {isOpen ? t("details.hide") : t("details.show")}
                  </button>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-cyan-300/70 mb-2">
                          {t("details.steps")}
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
                          {s.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      {Object.keys(s.parameters || {}).length > 0 && (
                        <div>
                          <div className="text-xs uppercase tracking-wider text-cyan-300/70 mb-2">
                            {t("details.parameters")}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {Object.entries(s.parameters).map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-white/[0.03] border border-white/10 rounded-lg p-2"
                              >
                                <span className="text-cyan-300 font-mono">{k}</span>
                                <span className="text-text-secondary"> — {v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs uppercase tracking-wider text-cyan-300/70 mb-2">
                          {t("details.evolution")}
                        </div>
                        <EvolutionTree skill={s} all={skills} />
                      </div>
                      {s.lastFailureReason && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-300">
                          {t("details.lastFailure")}: {s.lastFailureReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

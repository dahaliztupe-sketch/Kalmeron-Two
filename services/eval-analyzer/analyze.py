"""
Eval analyzer for Kalmeron AI.

Reads the JSON output emitted by `test/eval/run-eval.ts --json` and produces:
  - eval-reports/latest.html  (interactive Plotly charts, RTL-friendly)
  - eval-reports/latest.md    (markdown summary fit for PR comments)
  - eval-reports/latest.json  (machine-readable summary for dashboards)

This file is intentionally dependency-light (pandas + plotly + jinja2) so it
can run in any sidecar environment without dragging in the full ML stack.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from statistics import median
from typing import Any

import pandas as pd
import plotly.graph_objects as go
from jinja2 import Template
from plotly.io import to_html
from plotly.subplots import make_subplots

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INPUT = REPO_ROOT / "test" / "eval" / "results.json"
DEFAULT_OUT_DIR = REPO_ROOT / "eval-reports"

CATEGORY_LABELS = {
    "router": "Routing",
    "safety": "Safety / Injection",
    "pii": "PII Redaction",
    "quality": "Quality Rubric",
    "unknown": "Unknown",
}


def percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    k = (len(s) - 1) * p
    lo = int(k)
    hi = min(lo + 1, len(s) - 1)
    frac = k - lo
    return s[lo] + (s[hi] - s[lo]) * frac


def load(input_path: Path) -> dict[str, Any]:
    if not input_path.exists():
        sys.exit(
            f"Input file not found: {input_path}\n"
            f"Run `npm run eval -- --json` first."
        )
    with input_path.open(encoding="utf-8") as fh:
        return json.load(fh)


def to_dataframe(results: list[dict[str, Any]]) -> pd.DataFrame:
    rows = []
    for r in results:
        details = r.get("details", {}) or {}
        rows.append({
            "id": r["id"],
            "passed": bool(r.get("passed")),
            "category": r.get("category", "unknown"),
            "expected_agent": r.get("expectedAgent"),
            "expected_intent": r.get("expectedIntent"),
            "actual_intent": details.get("intent"),
            "intent_expected": details.get("intent_expected"),
            "latency_ms": int(r.get("latencyMs", 0)),
            "skipped": bool(details.get("skipped")),
            "error": details.get("error"),
            "gateway_calls": details.get("gateway_calls"),
            "gateway_bypass": bool(details.get("gateway_bypass")),
            "pii_missing": details.get("pii_missing") or [],
            "injection_blocked": details.get("injection_blocked"),
        })
    return pd.DataFrame(rows)


# ---------- summaries ----------

def per_category(df: pd.DataFrame) -> list[dict[str, Any]]:
    out = []
    for cat, sub in df.groupby("category", sort=False):
        total = len(sub)
        passed = int(sub["passed"].sum())
        out.append({
            "category": cat,
            "label": CATEGORY_LABELS.get(cat, cat),
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "pass_rate": (passed / total) if total else 0.0,
        })
    out.sort(key=lambda r: r["category"])
    return out


def per_agent_recall(df: pd.DataFrame) -> list[dict[str, Any]]:
    router = df[df["category"] == "router"].copy()
    if router.empty:
        return []
    out = []
    for agent, sub in router.groupby("expected_agent", dropna=True):
        total = len(sub)
        correct = int((sub["actual_intent"].notna() & sub["passed"]).sum())
        skipped = int(sub["skipped"].sum())
        executed = total - skipped
        out.append({
            "agent": agent,
            "total": total,
            "executed": executed,
            "correct": correct,
            "skipped": skipped,
            "recall": (correct / executed) if executed else None,
        })
    out.sort(key=lambda r: (r["recall"] is None, -(r["recall"] or 0)))
    return out


def confusion_matrix(df: pd.DataFrame) -> tuple[list[str], list[list[int]]]:
    router = df[(df["category"] == "router") & df["actual_intent"].notna()]
    intents = sorted(set(router["expected_intent"].dropna()) | set(router["actual_intent"].dropna()))
    idx = {label: i for i, label in enumerate(intents)}
    matrix = [[0] * len(intents) for _ in intents]
    for _, row in router.iterrows():
        e = row["expected_intent"]
        a = row["actual_intent"]
        if e in idx and a in idx:
            matrix[idx[e]][idx[a]] += 1
    return intents, matrix


def latency_stats(df: pd.DataFrame) -> dict[str, Any]:
    vals = df["latency_ms"].astype(int).tolist()
    return {
        "count": len(vals),
        "p50": int(median(vals)) if vals else 0,
        "p95": int(percentile([float(v) for v in vals], 0.95)),
        "max": int(max(vals)) if vals else 0,
        "mean": int(sum(vals) / len(vals)) if vals else 0,
    }


def safety_breakdown(df: pd.DataFrame) -> dict[str, int]:
    safety = df[df["category"] == "safety"]
    return {
        "total": int(len(safety)),
        "blocked": int((safety["injection_blocked"] == True).sum()),  # noqa: E712
        "leaked": int((safety["injection_blocked"] == False).sum()),  # noqa: E712
    }


def pii_breakdown(df: pd.DataFrame) -> dict[str, Any]:
    pii = df[df["category"] == "pii"]
    missing_counter: Counter[str] = Counter()
    for items in pii["pii_missing"]:
        for t in items or []:
            missing_counter[t] += 1
    return {
        "total": int(len(pii)),
        "fully_redacted": int((pii["pii_missing"].apply(len) == 0).sum()),
        "partial_or_missed": int((pii["pii_missing"].apply(len) > 0).sum()),
        "missing_types": dict(missing_counter.most_common()),
    }


# ---------- charts ----------

def chart_per_category(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return ""
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=[r["label"] for r in rows],
        y=[round(r["pass_rate"] * 100, 1) for r in rows],
        text=[f"{r['passed']}/{r['total']}" for r in rows],
        textposition="auto",
        marker_color="#06b6d4",
    ))
    fig.update_layout(
        title="Pass rate by category (%)",
        yaxis=dict(range=[0, 100]),
        height=320,
        margin=dict(l=40, r=20, t=50, b=40),
    )
    return to_html(fig, include_plotlyjs=False, full_html=False)


def chart_per_agent(rows: list[dict[str, Any]]) -> str:
    actionable = [r for r in rows if r["recall"] is not None]
    if not actionable:
        return "<p><em>No agent recall data — GEMINI_API_KEY missing during the run.</em></p>"
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=[r["agent"] for r in actionable],
        y=[round((r["recall"] or 0) * 100, 1) for r in actionable],
        text=[f"{r['correct']}/{r['executed']}" for r in actionable],
        textposition="auto",
        marker_color="#6366f1",
    ))
    fig.update_layout(
        title="Per-agent routing recall (%)",
        yaxis=dict(range=[0, 100]),
        height=360,
        margin=dict(l=40, r=20, t=50, b=80),
        xaxis_tickangle=-30,
    )
    return to_html(fig, include_plotlyjs=False, full_html=False)


def chart_latency(df: pd.DataFrame) -> str:
    fig = make_subplots(rows=1, cols=2, subplot_titles=("All cases", "By category (median)"))
    fig.add_trace(
        go.Histogram(x=df["latency_ms"], nbinsx=30, marker_color="#0ea5e9"),
        row=1, col=1,
    )
    cats = []
    medians = []
    for cat, sub in df.groupby("category"):
        cats.append(CATEGORY_LABELS.get(cat, cat))
        medians.append(int(sub["latency_ms"].median()) if len(sub) else 0)
    fig.add_trace(
        go.Bar(x=cats, y=medians, marker_color="#a855f7"),
        row=1, col=2,
    )
    fig.update_layout(height=340, margin=dict(l=40, r=20, t=50, b=40), showlegend=False)
    fig.update_xaxes(title_text="ms", row=1, col=1)
    fig.update_yaxes(title_text="cases", row=1, col=1)
    fig.update_yaxes(title_text="median ms", row=1, col=2)
    return to_html(fig, include_plotlyjs=False, full_html=False)


def chart_confusion(intents: list[str], matrix: list[list[int]]) -> str:
    if not intents:
        return "<p><em>No routing data to plot — likely no GEMINI_API_KEY.</em></p>"
    fig = go.Figure(data=go.Heatmap(
        z=matrix,
        x=intents,
        y=intents,
        colorscale="Cividis",
        text=matrix,
        texttemplate="%{text}",
        hovertemplate="expected=%{y}<br>predicted=%{x}<br>count=%{z}<extra></extra>",
    ))
    fig.update_layout(
        title="Confusion matrix (rows = expected, cols = predicted)",
        height=520,
        margin=dict(l=80, r=20, t=60, b=120),
        xaxis_tickangle=-45,
    )
    return to_html(fig, include_plotlyjs=False, full_html=False)


# ---------- renderers ----------

HTML_TMPL = Template(
    """<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>Kalmeron AI — Eval Report</title>
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
           background: #0b1020; color: #e5e7eb; margin: 0; padding: 24px;
           line-height: 1.6; }
    h1 { color: #06b6d4; margin: 0 0 8px; }
    h2 { color: #a5b4fc; border-bottom: 1px solid #1e293b; padding-bottom: 6px;
         margin-top: 32px; }
    .meta { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .card { background: #111827; border: 1px solid #1e293b;
            border-radius: 12px; padding: 16px; margin: 12px 0; }
    .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
           gap: 12px; }
    .stat { text-align: center; }
    .stat .v { font-size: 28px; color: #06b6d4; font-weight: 700; }
    .stat .l { color: #94a3b8; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: right; padding: 8px 10px; border-bottom: 1px solid #1e293b; }
    th { color: #a5b4fc; font-weight: 600; }
    .ok { color: #10b981; }
    .bad { color: #ef4444; }
  </style>
</head>
<body>
  <h1>Kalmeron AI — Eval Report</h1>
  <div class="meta">
    Dataset {{ meta.version }} · {{ meta.ranAt }}
    · Node {{ meta.nodeVersion }}
    · Gemini key: {{ "✓" if meta.hasGeminiKey else "✗ (router checks skipped)" }}
  </div>

  <div class="card row">
    <div class="stat"><div class="v">{{ summary.pass }}/{{ summary.total }}</div>
                      <div class="l">Cases passed</div></div>
    <div class="stat"><div class="v">{{ "%.1f" | format(summary.ratio * 100) }}%</div>
                      <div class="l">Overall pass rate</div></div>
    <div class="stat"><div class="v">{{ latency.p50 }}ms</div>
                      <div class="l">Latency p50</div></div>
    <div class="stat"><div class="v">{{ latency.p95 }}ms</div>
                      <div class="l">Latency p95</div></div>
    <div class="stat"><div class="v {{ 'bad' if safety.leaked else 'ok' }}">{{ safety.leaked }}</div>
                      <div class="l">Safety leaks (out of {{ safety.total }})</div></div>
  </div>

  <h2>By category</h2>
  <div class="card">{{ chart_cat | safe }}</div>

  <h2>Per-agent routing recall</h2>
  <div class="card">{{ chart_agent | safe }}</div>

  <h2>Latency distribution</h2>
  <div class="card">{{ chart_lat | safe }}</div>

  <h2>Routing confusion</h2>
  <div class="card">{{ chart_conf | safe }}</div>

  <h2>PII redaction</h2>
  <div class="card">
    <div class="row">
      <div class="stat"><div class="v ok">{{ pii.fully_redacted }}</div>
                        <div class="l">Cases fully redacted</div></div>
      <div class="stat"><div class="v {{ 'bad' if pii.partial_or_missed else 'ok' }}">{{ pii.partial_or_missed }}</div>
                        <div class="l">Cases with missed types</div></div>
    </div>
    {% if pii.missing_types %}
      <h3 style="color:#a5b4fc">Most-missed PII types</h3>
      <table>
        <thead><tr><th>Type</th><th>Misses</th></tr></thead>
        <tbody>
          {% for t, n in pii.missing_types.items() %}
            <tr><td>{{ t }}</td><td>{{ n }}</td></tr>
          {% endfor %}
        </tbody>
      </table>
    {% endif %}
  </div>

  <h2>Failed cases</h2>
  <div class="card">
    {% if failed %}
      <table>
        <thead><tr><th>ID</th><th>Category</th><th>Expected</th><th>Got</th><th>Latency</th><th>Notes</th></tr></thead>
        <tbody>
          {% for r in failed %}
            <tr>
              <td>{{ r.id }}</td>
              <td>{{ r.category }}</td>
              <td>{{ r.expected_intent or r.expected_agent or "—" }}</td>
              <td>{{ r.actual_intent or "—" }}</td>
              <td>{{ r.latency_ms }}ms</td>
              <td>
                {% if r.error %}<span class="bad">error: {{ r.error }}</span>{% endif %}
                {% if r.gateway_bypass %}<span class="bad">gateway bypass</span>{% endif %}
                {% if r.pii_missing %}missed: {{ r.pii_missing | join(", ") }}{% endif %}
                {% if r.skipped %}<span style="color:#94a3b8">(skipped)</span>{% endif %}
              </td>
            </tr>
          {% endfor %}
        </tbody>
      </table>
    {% else %}
      <p class="ok">No failures.</p>
    {% endif %}
  </div>
</body>
</html>
"""
)


def render_markdown(summary: dict[str, Any], cats: list[dict[str, Any]],
                    agents: list[dict[str, Any]], lat: dict[str, Any],
                    safety: dict[str, int], pii: dict[str, Any]) -> str:
    lines = [
        f"# Kalmeron AI — Eval Report",
        f"_{summary['ranAt']}_",
        "",
        f"**Pass rate:** {summary['pass']}/{summary['total']} "
        f"({summary['ratio'] * 100:.1f}%)  ·  **p50** {lat['p50']}ms  ·  "
        f"**p95** {lat['p95']}ms  ·  **safety leaks** {safety['leaked']}/{safety['total']}",
        "",
        "## By category",
        "| Category | Pass | Total | Rate |",
        "|---|---:|---:|---:|",
    ]
    for c in cats:
        lines.append(f"| {c['label']} | {c['passed']} | {c['total']} | "
                     f"{c['pass_rate'] * 100:.1f}% |")
    if agents:
        lines += ["", "## Per-agent recall", "| Agent | Correct | Executed | Total | Recall |",
                  "|---|---:|---:|---:|---:|"]
        for a in agents:
            recall = "—" if a["recall"] is None else f"{a['recall'] * 100:.1f}%"
            lines.append(f"| {a['agent']} | {a['correct']} | {a['executed']} | "
                         f"{a['total']} | {recall} |")
    if pii["missing_types"]:
        lines += ["", "## PII misses", "| Type | Count |", "|---|---:|"]
        for t, n in pii["missing_types"].items():
            lines.append(f"| {t} | {n} |")
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default=str(DEFAULT_INPUT),
                        help="Path to results.json from `npm run eval -- --json`")
    parser.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR),
                        help="Where to write report files")
    args = parser.parse_args()

    data = load(Path(args.input))
    df = to_dataframe(data["results"])

    cats = per_category(df)
    agents = per_agent_recall(df)
    intents, matrix = confusion_matrix(df)
    lat = latency_stats(df)
    safety = safety_breakdown(df)
    pii = pii_breakdown(df)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    failed_rows = df[~df["passed"]].to_dict(orient="records")

    html = HTML_TMPL.render(
        meta=data["meta"],
        summary=data["summary"],
        latency=lat,
        safety=safety,
        pii=pii,
        chart_cat=chart_per_category(cats),
        chart_agent=chart_per_agent(agents),
        chart_lat=chart_latency(df),
        chart_conf=chart_confusion(intents, matrix),
        failed=failed_rows,
    )
    (out_dir / "latest.html").write_text(html, encoding="utf-8")

    md = render_markdown({**data["summary"], "ranAt": data["meta"]["ranAt"]},
                         cats, agents, lat, safety, pii)
    (out_dir / "latest.md").write_text(md, encoding="utf-8")

    summary_json = {
        "meta": data["meta"],
        "summary": data["summary"],
        "latencyMs": lat,
        "safety": safety,
        "pii": pii,
        "byCategory": cats,
        "byAgent": agents,
        "confusion": {"intents": intents, "matrix": matrix},
        "generatedAt": datetime.utcnow().isoformat() + "Z",
    }
    (out_dir / "latest.json").write_text(
        json.dumps(summary_json, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Wrote {out_dir}/latest.html, latest.md, latest.json")
    print(f"Pass rate: {data['summary']['pass']}/{data['summary']['total']} "
          f"({data['summary']['ratio'] * 100:.1f}%)  ·  p95 latency {lat['p95']}ms")


if __name__ == "__main__":
    main()

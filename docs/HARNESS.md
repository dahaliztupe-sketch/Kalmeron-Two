# Harness — Engineering Operations Map

> **One-page index** of every loop, trail, and guardrail that makes the
> Kalmeron Two agent fleet safe in production. Each item points at the
> concrete file(s) that implement it. If you add a new safety mechanism,
> add it here; if you delete one, remove the row.

Last reviewed: 2026-04-25.

---

## 1. Verification Loops (Test-First + Eval-Gated)

| Loop | Where | Triggered by |
|---|---|---|
| Unit + integration tests | `test/**`, `vitest.config.ts` | `npm run test` |
| Firestore rules tests | `test/firestore-rules.test.ts` | `npm run test:rules` |
| End-to-end | `e2e/**`, `playwright.config.ts` | `npm run test:e2e` |
| AI golden-dataset eval | `test/eval/golden-dataset.json`, `test/eval/run-eval.ts` | `npm run eval` |
| LLM-as-judge | `services/llm-judge/`, `src/lib/eval/llm-judge-client.ts`, `src/ai/evaluation/advanced-judges.ts` | called from eval suite + chat routes |
| Council ensemble (Advocate/Critic/Jury) | `src/ai/meta/court-eval.ts`, `src/ai/panel/` | `withCouncil` in supervisor |
| CI eval gate (≥ 0.80 pass-rate) | `.github/workflows/eval.yml` | every PR touching `src/ai/**` |
| Coverage thresholds | `vitest.config.ts` (`coverage.thresholds`) | `npx vitest run --coverage` |

## 2. Tracing & Provenance Trail

| Layer | Where |
|---|---|
| Request id propagation | `src/lib/logger.ts::createRequestLogger`, `src/lib/security/route-guard.ts` (`X-Request-ID`) |
| Lightweight agent span | `src/lib/observability/tracer.ts::traceAgentExecution` |
| LLM observability | `src/lib/observability/langfuse.ts`, `src/lib/observability/arize.ts`, `src/lib/observability/galileo.ts` |
| Errors / perf | `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts` |
| Audit log (admin actions) | `src/lib/audit/log.ts` |
| Cost ledger (every model call) | `src/lib/observability/cost-ledger.ts` |

## 3. Rules of Engagement (Structured Documentation)

| Doc | Audience |
|---|---|
| `AGENTS.md` | every AI agent committing on this repo |
| `.windsurfrules` | Windsurf agent persistent memory |
| `.cursor/rules/{design,security,tech,product,structure,global-rules}.md` | Cursor agent |
| `CONTRIBUTING.md` | humans + agents (commits, tests, specs) |
| `docs/decisions/*` | architectural decisions (ADR) |
| `docs/agents/*` | per-agent System Cards (`_TEMPLATE.md`) |
| `docs/AGENT_GOVERNANCE.md` | OWASP-LLM-Top-10 / Microsoft Agent Governance Toolkit |
| `docs/THREAT_MODEL.md` | STRIDE + abuse cases |
| `docs/dpia/*` | DPIA: GDPR, EU AI Act, Egyptian PDPL Law 151/2020 |
| `docs/HARNESS.md` | this file — operational map |

## 4. Six Engineering Challenges — Mitigations

| Challenge | Mitigation files |
|---|---|
| **Task path collapse** | `src/lib/security/max-step-guard.ts` (StepBudget), `src/lib/security/plan-guard.ts` (verifyPlan + gatekeep), `src/ai/orchestrator/supervisor.ts` (intent classifier + per-agent rate limit), `src/lib/security/agent-os.ts` (circuit breaker + kill switch) |
| **RAG depth erosion** | `src/lib/security/context-quarantine.ts` (Schneier seat), `src/lib/rag/self-rag.ts` (reflectOnRetrieval), `src/lib/rag/crag.ts` (corrective query rewrite) |
| **Cost runaway** | `src/lib/observability/cost-ledger.ts` (per-call event), `src/lib/billing/budget-guard.ts::enforceBudget` (hard monthly cap), `src/lib/routing/advanced-routing.ts` (cheap-tier router), `app/api/cron/aggregate-costs/route.ts` |
| **Tool-call risk** | `src/lib/security/agent-governance.ts` (low/high/critical + human approval), `src/lib/security/agent-os.ts` (Ring 0–3), `src/lib/security/plan-guard.ts` (indirect injection check) |
| **Regulatory compliance** | `src/lib/compliance/pii-redactor.ts`, `firestore.rules` (deny-by-default), `docs/THREAT_MODEL.md`, `docs/dpia/*`, `docs/AGENT_GOVERNANCE.md` |
| **Memory crisis** | `src/lib/memory/advanced-memory.ts` (Zep + Mem0), `src/lib/memory/knowledge-graph.ts` (Neo4j), `src/lib/memory/compress-context.ts` (windowed summarizer), `src/lib/llm/prompt-cache.ts` |

## 5. Eight Agentic Coding Patterns — Anchors

| Pattern | Anchor |
|---|---|
| AGENTS.md convention | `AGENTS.md`, `.windsurfrules`, `.cursor/rules/**`, `docs/agents/_TEMPLATE.md` |
| Test-First | `test/**`, `e2e/**`, `vitest.config.ts`, `playwright.config.ts`, `test/eval/**` |
| Conventional Commits | `CONTRIBUTING.md`, `scripts/check-commit-message.mjs`, `docs/decisions/0004-conventional-commits.md` |
| Structured Logging | `src/lib/logger.ts` (pino + redact), `src/lib/security/sanitize-log.ts` |
| Error Boundary | `app/global-error.tsx`, `app/(dashboard)/error.tsx`, `components/ui/ErrorBoundary.tsx` |
| API Error Handling | `src/lib/security/api-error.ts` (HTTPError + Problem+JSON), `src/lib/security/route-guard.ts` |
| Feature Scaffolding | `scripts/scaffold-feature.mjs`, `src/features/**`, `docs/agents/_TEMPLATE.md` |
| Spec-First | `docs/decisions/**`, `docs/api/openapi.yaml`, `src/lib/schemas.ts`, `src/ai/panel/types.ts` |

## 6. Provenance Trail — User-Facing Trace IDs

Every API response from `guardedRoute` carries an `X-Request-ID` header.
Errors thrown as `HTTPError` are returned as RFC 9457 Problem+JSON with
`type`, `title`, `status`, `code`, `detail`, `instance`. Both fields can be
joined against `audit_logs/{...}.requestId`, `cost_events/{...}.requestId`,
and Langfuse traces to reconstruct the full provenance of any agent
decision.

## 7. CISO 7-Point Checklist — Pointer

Mapped in `docs/AGENT_GOVERNANCE.md`. Quick anchors:

1. Inventory → `docs/agents/`, `src/ai/agents/`
2. Behavioral baseline → `test/eval/`, Langfuse dashboards
3. Permissions parity → `firestore.rules`, `src/lib/security/rbac.ts`
4. Blast radius → `src/lib/security/agent-os.ts` (rings + circuit breaker)
5. AI-specific detection → Langfuse + Sentry + `src/lib/security/plan-guard.ts`
6. Incident readiness → `docs/RUNBOOK.md`
7. Re-approval triggers → `src/lib/security/agent-governance.ts`

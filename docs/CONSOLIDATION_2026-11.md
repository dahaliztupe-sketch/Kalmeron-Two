# Consolidation map (company-in-a-box), 2026-11-26

Status: plan. Nothing deleted or moved. Local branch only, reversible by commit.
Method: map each existing agent dir in src/ai/agents to one company role. Overlaps get wrapped by the role spec in src/lib/company/roles and marked "legacy" here. Deletion only after a role has a tested replacement and a human has agreed.
Unverified: usage counts. A quick import scan was unreliable (relative imports like ./prompt were missed), so no dead-code claims are made yet.

| Role (roadmap order) | Existing agents that overlap | Plan |
|---|---|---|
| 1 Marketing | marketing-strategist, cmo, content-creator, ads-manager, seo-manager, brand-builder, persona-generator, competitor-intel, market-researcher | Role `marketing` is the owner (done, with quality checks). Others stay as legacy one-shot helpers; fold their prompt ideas into the role knowledge base after review. |
| 2 Sales | sales-strategist, sales-coach, sales-pipeline, lead-qualifier, acquisition-strategist, customer-discovery | Next role. |
| 3 Finance | cfo-agent, financial-modeling, budget-analyst, cash-runway, forecaster, valuation-expert, investment-advisor, equity-manager | Merge under `finance`. |
| 4 Product/Dev | product-manager, cto, devops-engineer, qa-manager, code-interpreter, okr | Merge under `product`. |
| 5 Legal/Admin (Egypt) | clo, legal-guide, contract-drafter, contract-reviewer, compliance, data-privacy, ip-protector, admin | Merge under `legal`. Needs Egypt-law sources and a lawyer-review notice. |
| 6 Ops/HR | coo, operations-manager, chro, hiring-advisor, org-designer, performance-manager, culture-expert, wellbeing-coach, interview-simulator | Two roles: `operations`, `hr`. |
| 7 Orchestrator | ceo, cso, board-advisor, cofounder-coach, digital-twin, knowledge-builder, expansion-planner, pitch-deck, insights-analyzer, csat-analyst, customer-support, ticket-manager | `orchestrator` routes to roles; support goes to a later `customer-success` role. |
| Out of scope for now | real-estate | Keep, not part of the first customer path. |

Other duplicates to review: src/agents/* (idea-validator, plan-builder, mistake-shield, ...) vs /api/ideas/analyze plan format; dashboard hr vs hr-ai; /ideas variants.

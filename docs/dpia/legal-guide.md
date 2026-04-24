# Data Protection Impact Assessment (DPIA)
## Legal Guide Agent — Kalmeron Two

**Document version:** 1.0 · **Date:** 24 April 2026 · **Author:** Compliance Engineering · **Reviewer:** External Counsel (TBD)
**Regulatory frameworks:** EU AI Act (Regulation 2024/1689), GDPR (Regulation 2016/679), Egypt PDPL Law 151/2020, Saudi PDPL (Royal Decree M/19/1443)

> ⚠️ **Status:** Draft — must be reviewed and signed by qualified legal counsel before public launch. The Legal Guide agent **must not** be exposed to end users until §10 (Approval) is signed.

---

## 1. Identification of the processing operation

### 1.1 Name & purpose
**Legal Guide Agent** — a conversational AI assistant that answers Egyptian and GCC entrepreneurs' questions about commercial law, company formation, intellectual property, employment law, contracts, and tax obligations.

### 1.2 Why a DPIA is required (Article 35 GDPR + Annex III EU AI Act §5(b))
The Legal Guide Agent is classified as **High-Risk AI System** under EU AI Act because:
- It provides "advice intended to guide the natural person's decisions in relation to legal matters" — explicitly listed in Annex III §5.
- Its outputs may influence decisions about company formation, employment relationships, and contractual obligations with **material legal and financial consequences**.
- It processes potentially sensitive personal data (financial situations, employment disputes, business ownership structures).

### 1.3 Lifecycle covered
- Data collection (user prompts + uploaded documents)
- Data processing (LLM inference via Gemini PRO)
- Data storage (chat history + audit logs)
- Data sharing (third-party LLM providers, observability tools)
- Data deletion (GDPR right to erasure + 30-day grace period)

---

## 2. Description of processing activities

### 2.1 Data flow diagram (textual)
```
User browser
    │ (1) HTTPS POST /api/orchestrator/receptionist
    ▼
Next.js Edge → Route Guard (auth + rate limit + PII redact attempt)
    │ (2) intent="legal" → orchestrator routes to legal_guide_node
    ▼
src/ai/agents/legal/orchestrator.ts
    │ (3) PII redactor (src/lib/security/pii-redactor.ts) sanitizes input
    │ (4) Plan guard verifies allow-listed tools only
    ▼
Google Gemini PRO API (us-central1) ──── (LLM inference)
    │ (5) Response sanitization + citation extraction
    ▼
Firestore (chat_history) + Audit log (audit_logs)
    │ (6) Optional: Langfuse trace (opt-out via env)
    ▼
User browser receives response with mandatory disclaimer banner
```

### 2.2 Categories of personal data processed

| Category | Source | Purpose | Lawful basis |
|---|---|---|---|
| Name, email | Firebase Auth profile | Account identification | Contract performance (GDPR 6(1)(b)) |
| Free-text legal question | User input | Generate legal information | Contract performance |
| Uploaded contracts/documents | User upload (optional) | Contextual analysis | Contract performance + explicit consent |
| Financial situation snippets | User input | Tailored advice | Contract performance |
| Business ownership data | User input | Determine applicable law | Contract performance |
| IP address, user-agent | HTTP request | Rate limiting + fraud prevention | Legitimate interest (GDPR 6(1)(f)) |
| LLM prompt/response (full) | System | Audit trail + model evaluation | Legitimate interest + legal obligation |

### 2.3 Special categories (Article 9 GDPR)
**Default: NOT processed.** The PII redactor blocks Egyptian/Saudi national IDs (which encode birthdate). However, users may **voluntarily disclose**:
- Religious affiliation (in personal-status law contexts)
- Political opinions (in NGO formation contexts)
- Trade union membership (in labor disputes)

**Mitigation:** Pre-prompt warning displayed before each Legal Guide session: "لا تشارك بيانات حسّاسة (دين، صحة، انتماء سياسي) — استشر محامياً مرخّصاً لهذه المسائل."

### 2.4 Data subjects affected
- Egyptian residents (primary)
- GCC residents (secondary)
- EU residents using the platform (rare but possible — full GDPR applies)

### 2.5 Recipients
| Recipient | Role | Location | Safeguard |
|---|---|---|---|
| Google (Gemini API) | Sub-processor | US (us-central1) | DPA signed; Standard Contractual Clauses; Google Cloud SCCs |
| Firebase / GCP | Processor (storage + auth) | US (us-central1) | Same DPA / SCCs |
| Vercel | Processor (hosting) | EU (fra1) — **must verify** | DPA + EU data residency for EU users |
| Sentry | Processor (error tracking) | EU (de) | DPA signed; PII scrubber enabled |
| Langfuse | Processor (LLM observability) | EU (de) | DPA signed; opt-out per workspace |
| Stripe | Processor (payments only — not legal data) | US/EU | DPA signed |

### 2.6 International transfers
- **EU → US:** Gemini API + Firebase + Sentry. Mitigated by Standard Contractual Clauses 2021/914 + supplementary measures (encryption in transit + at rest).
- **Egypt → US:** Per PDPL 151/2020 Article 14, cross-border transfer requires either:
  - (a) Adequacy decision (none yet), OR
  - (b) Explicit user consent → **must be collected via consent ledger** (`src/lib/compliance/consent-ledger.ts`).
- **Saudi → US:** Per Saudi PDPL Article 29, transfer must be either to an "adequate" jurisdiction (US not listed) or with prior approval from SDAIA. **Action:** flag for Saudi users — block Legal Guide until SDAIA approval, or require explicit consent.

---

## 3. Necessity & proportionality

### 3.1 Why this processing is necessary
Egyptian SME founders lack affordable access to qualified legal counsel (average ~EGP 2,000/hour). The Legal Guide agent provides **information** (not advice) at low cost, addressing a documented legal-aid gap (cf. World Bank Egypt SME Report 2023, p. 47).

### 3.2 Proportionality controls
- **Data minimization:** PII redactor strips identifiers before LLM call — model never sees national IDs, phone numbers, or addresses.
- **Purpose limitation:** Chat history is **not** used to train the underlying Gemini model (Google's API setting `excludeFromTraining: true` enforced in `src/lib/llm/providers.ts`).
- **Storage limitation:** Chat history retained for 90 days by default; user can delete on demand via `/settings/privacy`.
- **Accuracy:** Each response cites at least one statute reference; outputs without citations are flagged for human review.

### 3.3 Right of objection / restriction
Implemented via:
- `POST /api/account/delete` — soft delete + 30-day grace
- `POST /api/account/export` — GDPR Article 20 portability
- `/settings/privacy` UI — granular opt-outs (Langfuse tracing, marketing emails, telemetry)

---

## 4. Risk assessment

| # | Risk | Likelihood | Severity | Risk score | Mitigation |
|---|---|---|---|---|---|
| R1 | **Hallucinated legal advice** causes user to make wrong decision (e.g., wrong company structure) | Medium | High | 🟠 High | Mandatory disclaimer; citation requirement; "always verify with licensed attorney" prompt; eval suite with golden set of 30+ legal questions |
| R2 | **Unauthorized practice of law** under Egyptian Law 17/1983 (Bar Association) | Low | High | 🟠 High | Output framed as "information not advice"; no representation in court; Terms of Service explicitly disclaim attorney-client relationship |
| R3 | **Cross-tenant data leak** via prompt injection | Low | Critical | 🟠 High | `prompt-guard.ts` + `context-quarantine.ts` + Firestore rules deny-all + per-workspace scoping |
| R4 | **Sensitive PII reaches LLM** (e.g., national ID typed in free text) | Medium | Medium | 🟡 Medium | PII redactor with 10 categories incl. Egyptian/Saudi IDs; pre-prompt warning |
| R5 | **Output bias** (e.g., favoring incorporation over partnership) | Medium | Medium | 🟡 Medium | Bias eval in red-team cron; quarterly review of agent outputs by legal counsel |
| R6 | **Vendor lock-in to Gemini** affects continuity | Low | Medium | 🟡 Medium | Multi-provider fallback (Anthropic, OpenAI) in `src/lib/llm/gateway.ts` |
| R7 | **Cross-border transfer compliance** breach (Saudi/EU) | Medium | High | 🟠 High | Consent ledger; geo-blocking for Saudi/EU until SCCs verified; DPO contact in privacy policy |
| R8 | **Audit log tampering** | Very Low | High | 🟡 Medium | Append-only via Admin SDK; no client write rules; immutable via Firestore rules |
| R9 | **User mistakes Legal Guide for licensed attorney** | High | Medium | 🟠 High | Persistent UI banner + first-message disclaimer + quarterly UX research validation |
| R10 | **EU AI Act non-compliance** (transparency obligations) | Medium | High | 🟠 High | This DPIA + system card + AI register entry (publish at `/ai-register`) |

### 4.1 Residual risk acceptance
After mitigations, **R1, R2, R7, R9, R10** remain at "High" residual risk. These are accepted with the following conditions:
- Public launch gated on signed DPIA + signed Terms of Service review by Egyptian-licensed counsel.
- First 90 days = closed beta only (≤500 users) with elevated monitoring.
- Quarterly audit of 100 random Legal Guide conversations by external counsel.

---

## 5. EU AI Act specific requirements (Annex III §5(b))

### 5.1 Article 9 — Risk management system
✅ This DPIA + `docs/THREAT_MODEL.md` + `docs/agents/legal-guide.md` (system card).

### 5.2 Article 10 — Data governance
✅ Training data: N/A (we do not fine-tune; we use base Gemini PRO).
✅ Input data validation: PII redactor + length limits + intent classifier.

### 5.3 Article 11 — Technical documentation
✅ This DPIA + system card + threat model + RUNBOOK + DATA_LINEAGE (TBD).

### 5.4 Article 12 — Record keeping
✅ Audit log records every Legal Guide invocation (actor, timestamp, request ID, outcome). Retained per legal obligation (10 years for tax-related queries per Egyptian Law 91/2005).

### 5.5 Article 13 — Transparency to users
✅ Persistent banner: "هذه إجابة آلية للأغراض المعلوماتية فقط — استشر محامياً مرخّصاً قبل أي قرار نهائي."
✅ AI register entry at `/ai-register` (TBD — must publish before launch).

### 5.6 Article 14 — Human oversight
✅ Outputs flagged "high stakes" (e.g., dissolution, criminal liability) queue human review via `agent-governance.ts`.
✅ User can opt-in to "always require human review" mode (premium feature).

### 5.7 Article 15 — Accuracy, robustness, cybersecurity
✅ Eval suite with 30+ golden legal questions; pass-rate threshold ≥ 80%.
✅ Multi-provider fallback for resilience.
✅ Threat model addresses prompt injection (LLM01) and data leak (LLM06).

### 5.8 Article 26 — Deployer obligations
✅ User receives clear instructions in Terms of Service.
✅ Logs preserved for at least 6 months (Article 26(6)).

---

## 6. Consultation

### 6.1 Internal stakeholders consulted
- Engineering (Security, AI/ML, Backend)
- Product (UX research, Founder Council)
- Compliance (this document)

### 6.2 External stakeholders to consult before launch
- [ ] Egyptian-licensed attorney (for §2.3, §3.1, §4.R2)
- [ ] Saudi data protection consultant (for §2.6 SDAIA pathway)
- [ ] EU Data Protection Officer (for §5)
- [ ] User research (10 founders for disclaimer comprehension test)

---

## 7. Compliance with PDPL Egypt (Law 151/2020)

| PDPL Requirement | Implementation |
|---|---|
| Article 2 — Definitions | Legal Guide processes "personal data" and creates "automated decisions" (Article 17 applies) |
| Article 7 — Lawful basis | Contract performance (registration) + explicit consent (cross-border) |
| Article 12 — Data subject rights | `/settings/privacy` UI exposes access, rectification, erasure, portability |
| Article 14 — Cross-border transfer | Consent ledger captures explicit consent before any US transfer |
| Article 17 — Automated decisions | Disclaimer + human-review opt-in + right to challenge |
| Article 18 — Data Protection Officer | DPO contact `dpo@kalmeron.com` published in `/privacy` |
| Article 35 — Notification of breach | 72h notification per `docs/RUNBOOK.md` §6 |

---

## 8. Compliance with Saudi PDPL

| Saudi PDPL Article | Implementation |
|---|---|
| Article 5 — Data minimization | PII redactor before LLM |
| Article 12 — Consent | Granular consent ledger |
| Article 17 — Sensitive data | Special categories blocked or require explicit consent |
| Article 22 — Data retention | 90-day default, user-controlled |
| Article 29 — Cross-border | **OPEN ISSUE — needs SDAIA opinion before Saudi launch** |
| Article 31 — Breach notification | 72h to SDAIA + affected subjects |

---

## 9. Action items before launch

| # | Action | Owner | Due | Status |
|---|---|---|---|---|
| A1 | Sign DPIA with external counsel | Legal | 2026-05-15 | ❌ Open |
| A2 | Publish AI register at `/ai-register` | Engineering | 2026-05-08 | ❌ Open |
| A3 | Verify Vercel EU data residency for EU users | Engineering | 2026-05-08 | ❌ Open |
| A4 | Saudi geo-block until SDAIA opinion received | Engineering | 2026-05-15 | ❌ Open |
| A5 | Update Terms of Service with attorney-client disclaimer | Legal | 2026-05-15 | ❌ Open |
| A6 | Quarterly review process documented in `docs/COMPLIANCE_REVIEW.md` | Compliance | 2026-05-31 | ❌ Open |
| A7 | Eval suite golden set expanded to 30+ legal questions | AI/ML | 2026-05-15 | ❌ Open |
| A8 | DPO contact published in `/privacy` page | Legal | 2026-05-08 | ❌ Open |

---

## 10. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Compliance Engineering | _____________ | _____________ | _____________ |
| External Egyptian Counsel | _____________ | _____________ | _____________ |
| EU Data Protection Officer | _____________ | _____________ | _____________ |
| CTO | _____________ | _____________ | _____________ |

**This DPIA must be reviewed annually and re-signed after any of the following:**
- Change in LLM provider
- Change in data flow architecture
- Change in target user geography
- Change in EU AI Act / GDPR / PDPL regulations
- After any data breach or significant incident

---

## Annex A — Reference documents
- `docs/THREAT_MODEL.md` — STRIDE + OWASP LLM Top 10
- `docs/agents/README.md` — Agent risk register
- `docs/agents/legal-guide.md` — System card (TBD)
- `docs/RUNBOOK.md` — Incident response
- `src/lib/security/pii-redactor.ts` — PII categories
- `src/lib/compliance/consent-ledger.ts` — Consent storage

## Annex B — EU AI Act Annex III §5(b) full text
> "AI systems intended to be used by judicial authorities or on their behalf to assist judicial authorities in researching and interpreting facts and the law and in applying the law to a concrete set of facts, or to be used in a similar way in alternative dispute resolution; AI systems intended to be used to influence the outcome of an election or referendum or the voting behaviour of natural persons in the exercise of their vote in elections or referenda."

The Legal Guide does **not** assist judicial authorities and does **not** influence elections, but is included under §5(b) by virtue of the broader Annex III §5 category covering "access to and enjoyment of essential private services" — specifically legal advice.

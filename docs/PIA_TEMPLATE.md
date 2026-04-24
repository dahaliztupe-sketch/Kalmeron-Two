# Privacy Impact Assessment (PIA) — Template

**Version:** 1.0 · **Owner:** DPO · **Source:** P0-6 from `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`

A PIA must be completed and signed off **before** any new agent, integration, or
data-flow is shipped to production. Copy this file to
`docs/pia/<YYYY-MM-DD>-<feature>.md` and fill in every section.

---

## 1. Identification

- **Feature / Agent / Integration name:**
- **Owner (engineer):**
- **Reviewer (DPO):**
- **Target launch date:**
- **Affected user segments (geographies, plans, B2B/B2C):**

## 2. Data inventory

| Category | Field examples | Source | Sensitivity (Low/Med/High) | Justification |
|---|---|---|---|---|
| Identifiers | userId, workspaceId | Firebase Auth | Low | required for routing |
| Profile | name, email | onboarding form | Med | personalized agent replies |
| Business | revenue, margins, payroll | user upload / connector | High | financial agent input |
| Telemetry | event timestamps, IP | server logs | Med | abuse / cost monitoring |
| AI inputs | full prompt text | user → gateway | High | sent to provider for inference |
| AI outputs | generated text | provider → user | High | stored in chat history |

## 3. Lawful basis (PDPL / Law 151 / GDPR)

- [ ] Consent — explicit, recorded in `consent_events` collection with timestamp + scope.
- [ ] Contract — necessary for service delivery (cite clause).
- [ ] Legitimate interest — balancing test attached.
- [ ] Legal obligation — cite statute.

If consent is the basis, document the wording the user sees.

## 4. Data flow diagram

(Sketch or paste a diagram. Include: client → API → gateway → provider →
storage. Mark every cross-border hop and note residency.)

## 5. Third-party processors

| Vendor | Country | Role | DPA signed | SCCs (if EU data) |
|---|---|---|---|---|
| Google Gemini | US/global | LLM provider | yes/no | yes/no |
| Anthropic | US/global | LLM fallback | yes/no | yes/no |
| Firebase / GCP | US, EU, ME | data store + auth | yes (G Cloud DPA) | n/a |
| Vercel | US, EU | hosting + edge | yes | yes |
| Sentry | US, EU | error tracking | yes | yes |
| PostHog | EU | analytics (PII-stripped) | yes | yes |

For every vendor listed, the DPO confirms a current Data Processing Agreement
is on file. Vendors marked "no" block the launch.

## 6. Risk assessment

For each row, score Likelihood (1–5) × Impact (1–5) and provide a mitigation.

| Risk | L | I | Score | Mitigation | Residual |
|---|---|---|---|---|---|
| Prompt injection leaks system instructions | | | | sanitize-input + gateway block list | |
| Provider trains on customer data | | | | contract no-train clause + zero-retention header | |
| Cross-border transfer without legal basis | | | | SCCs in place + region-pinned project | |
| Excessive retention | | | | retention matrix + nightly purge job | |
| Right-to-erasure not honored end-to-end | | | | E2E test in `test/erasure.test.ts` | |

## 7. Retention & deletion

- **Default retention** for this feature:
- **User-initiated deletion path:** `/account/data-export` and `/account/delete`
- **Scheduled purge job:** name + cadence
- **Audit:** how do we *prove* the data is gone?

## 8. Subject rights

- [ ] Right to access — covered by `/account/data-export`.
- [ ] Right to rectification — covered by profile editor.
- [ ] Right to erasure — covered by deletion path above.
- [ ] Right to portability — JSON export.
- [ ] Right to object — opt-out toggle in settings.
- [ ] Right not to be subject to solely-automated decisions — human-in-loop confirmed for financial/legal recommendations above 5,000 EGP impact.

## 9. Technical controls

- Authentication: Firebase ID token + scoped API key.
- Authorization: RBAC matrix (`src/lib/security/rbac.ts`).
- Encryption in transit: TLS 1.3 enforced.
- Encryption at rest: AES-256 (provider managed).
- Logging: `audit_logs` append-only; access scoped via Firestore rules.
- PII redaction: `src/lib/compliance/pii-redactor.ts` runs before any LLM call.

## 10. Sign-off

- [ ] Engineer (owner) — date, name
- [ ] DPO — date, name
- [ ] Tech Lead — date, name
- [ ] CEO (if High-risk row scored ≥ 15) — date, name

The launch is blocked until all required signatures are present.

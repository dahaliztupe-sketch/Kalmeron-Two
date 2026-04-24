# Consent Ledger — PDPL & GDPR readiness

**Legal basis:** Egyptian PDPL 151/2020 + GDPR (for EU users). Both require an
auditable record of *which* consent the user gave, *when*, and *to what version*
of the policy.

## Data model

Firestore collection: `consent_events`

```
{
  userId: string,
  workspaceId?: string,
  consentType: 'tos' | 'privacy' | 'marketing_email' | 'whatsapp_outreach' |
               'data_export' | 'ai_training_optout',
  policyVersion: string,           // e.g. 'tos@2026-04-01'
  granted: boolean,                // false = withdrawn
  ip?: string,
  userAgent?: string,
  collectedAt: Timestamp,          // server timestamp
  source: 'signup' | 'settings' | 'modal' | 'api',
  signature?: string,              // optional HMAC for tamper-evidence
}
```

Firestore rules:
- `read`: only the owning user OR a platform admin.
- `create`: server-side only (Admin SDK).
- `update`/`delete`: **denied** — record withdrawal as a new `granted: false`
  event.

## Capture points

| Where | What | Code path |
|---|---|---|
| Signup | TOS + Privacy at the same time | `app/auth/signup/page.tsx` → `/api/consent/grant` |
| Onboarding step 3 | Marketing email opt-in | `app/onboarding/page.tsx` |
| Settings → Privacy | Per-channel toggles + AI training opt-out | `app/(dashboard)/settings/privacy/page.tsx` |
| API onboarding | Programmatic consent for org-managed users | `POST /api/consent/grant` |

## Reading the current state

`src/lib/consent/state.ts` exposes:

```ts
hasConsent(userId, type): Promise<boolean>
listConsent(userId): Promise<ConsentEvent[]>
withdrawConsent(userId, type): Promise<void>
```

The first call walks `consent_events` ordered by `collectedAt desc` and returns
the latest `granted` value for the type.

## Right to erasure

`/api/account/delete` writes a `withdrawConsent` event for *every* recorded
consent, then schedules data deletion (30-day grace per Egyptian regulator
guidance). The `consent_events` rows themselves are **retained** (legal evidence
that consent was once given and then withdrawn).

## Right to data portability

`/api/account/export` includes the entire `consent_events` history in the JSON
bundle.

## Audit & evidence

- Each event is also mirrored to the immutable `audit_logs` collection with
  `action: 'consent_granted'` or `'consent_withdrawn'`.
- Quarterly review by Legal: spot-check 30 random workspaces.

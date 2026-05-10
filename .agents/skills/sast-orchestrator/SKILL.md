---
name: sast-orchestrator
description: Run all 13 SAST security skills in parallel as subagents and produce a unified security report. Use when performing a comprehensive security audit of the codebase, before major releases, or when reviewing changes to API routes and authentication code.
---

# SAST Orchestrator — Full Security Scan

Runs all 13 SAST skills in parallel and produces `sast/final-report.md` sorted by severity.

## When to Use

- Before every major release
- When reviewing PRs that touch `app/api/`, `src/lib/security/`, `src/lib/auth/`
- Monthly scheduled security audit
- After adding new API endpoints or file upload features

## Execution Plan

### Phase 1: Launch All Scanners in Parallel

Dispatch the following 13 subagents simultaneously:

| Agent | Skill | Target |
|---|---|---|
| sql-scanner | `sast-sql-injection` | `app/api/**`, `src/lib/**` |
| xss-scanner | `sast-xss` | `components/**`, `app/**` |
| rce-scanner | `sast-rce` | `app/api/**`, Python workers |
| ssrf-scanner | `sast-ssrf` | `app/api/**` (HTTP fetch calls) |
| idor-scanner | `sast-idor` | `app/api/**` (all CRUD routes) |
| xxe-scanner | `sast-xxe` | File upload handlers, PDF worker |
| ssti-scanner | `sast-ssti` | Template usage, LLM prompts |
| jwt-scanner | `sast-jwt` | `src/lib/auth/**`, middleware |
| path-scanner | `sast-path-traversal` | File operations, upload endpoints |
| upload-scanner | `sast-file-upload` | `app/api/user/avatar/**` |
| auth-scanner | `sast-broken-auth` | Auth flows, session management |
| missing-scanner | `sast-missing-auth` | All `app/api/**` routes |
| graphql-scanner | `sast-graphql` | GraphQL endpoints (if any) |

### Phase 2: Collect and Deduplicate Results

Aggregate all findings and remove duplicates (same file + same pattern).

### Phase 3: Generate Final Report

```markdown
# SAST Security Report — Kalmeron AI
Date: {ISO date}
Scanner: sast-orchestrator v1.0

## Executive Summary
- Critical: {count}
- High: {count}
- Medium: {count}
- Low: {count}
- Total: {count}

## Critical Findings (Fix immediately)
[findings sorted by file]

## High Findings (Fix before release)
[findings]

## Medium Findings (Fix this sprint)
[findings]

## Passed Checks
[categories with no findings]
```

Save to: `sast/final-report.md`

### Phase 4: CI/CD Gate Decision

```
if Critical > 0 OR High > 3:
  → EXIT 1 (fail CI)
else if Medium > 10:
  → EXIT 0 with WARNING
else:
  → EXIT 0 (pass)
```

## Quick Audit Mode (Targeted)

For PR review of specific changes, run only relevant scanners:

```bash
# If PR touches app/api/user/avatar:
→ Run: sast-file-upload, sast-idor, sast-missing-auth, sast-path-traversal

# If PR touches app/api/billing:
→ Run: sast-missing-auth, sast-idor, sast-ssrf

# If PR touches src/lib/auth:
→ Run: sast-broken-auth, sast-jwt, sast-missing-auth
```

## Kalmeron Priority Matrix

Based on the architecture, these are highest-risk areas:

1. **`app/api/user/avatar/`** → file-upload + path-traversal + idor
2. **`app/api/billing/fawry/`** → ssrf + missing-auth + broken-auth
3. **`app/api/chat/`** → ssti (LLM prompt injection) + missing-auth
4. **`PDF Worker` (port 8000)** → xxe + rce + path-traversal + ssti
5. **`app/api/notifications/`** → idor + missing-auth

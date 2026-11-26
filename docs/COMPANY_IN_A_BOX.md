# Company in a box (status 2026-11-26, local branch)

Six role agents (marketing, sales, finance, product, legal/admin Egypt, ops/HR) run in that order on one Company Brief built from a validated plan. A dashboard on /validate runs them, shows each draft, lets the user regenerate and mark a draft reviewed. The mark is local and not saved.

What this is: AI-drafted plans and message drafts with a quality gate (schema, number and wording checks) and a small sourced knowledge base per role (source URL, source date, review date, status, stale flag).

What this is not:
- Not verified expert output. Tests cover schema, checks and knowledge hygiene, not live model quality. No role output has been read and judged by a human yet.
- Not up to date by itself. The model has no live news; knowledge is only as fresh as each item's review date (90 days max, then flagged).
- Not legal, tax or financial advice. Egypt legal and tax items are mostly secondary sources or unofficial translations and are flagged needs_check.
- Roles do not send, post, pay or sign. Drafts only.
- Orchestrator does not yet feed one role's output into the next; every role reads the same brief.

Refresh process: re-open each source, update reviewedOn, edit or drop changed claims, keep status honest. Rules: docs/CONTRACT.md. Overlap map with older agents: docs/CONSOLIDATION_2026-11.md.

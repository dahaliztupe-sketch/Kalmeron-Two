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

## Workflow (added 2026-11-26)

Flow on /validate: validated plan -> intake questions -> marketing -> sales -> finance -> product -> legal -> ops -> consolidated export.

- **Intake** (src/lib/company/intake.ts): six fixed questions, no model call. Stage and team size are required. Answers go into every role prompt as founder-provided data. Unanswered questions are marked so roles write assumptions, not guesses.
- **Stage gates** (orchestrator `blockedBy`): a role runs only after every earlier role is approved and not stale. Approval is a local review mark in the browser. It is a review habit, **not** a security control: the server does not enforce order, and nothing is saved between visits.
- **Staleness**: regenerating a role marks its readers (transitively) stale, drops their approval, and blocks later stages until they are regenerated and re-approved. A stale draft cannot be approved.
- **Export** (src/lib/company/export.ts): one Markdown file with the plan summary, intake answers, and each role section labelled approved / unreviewed draft / stale / not run, plus the disclaimer. Export is a download only; nothing is sent.
- **Limits**: outputs are AI drafts; "approved" means the founder read it. Legal/tax/finance sections still need a professional. No real-user run of this flow yet.

# Founder's Letter — Monthly Template

**Cadence:** First Tuesday of every month.
**Channel:** Email list + `/blog/founders-letter/<YYYY-MM>` + LinkedIn re-post.
**Owner:** Founder.
**Source:** R-4 from `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`.

---

## Why this exists

Transparency is a Quality Moat. Sharing real numbers — including the ugly ones —
builds the kind of trust that no marketing budget can buy. Stripe, Buffer,
GitLab, and Lenny's Newsletter all proved this works. We do it monthly without
fail.

The letter is **never** edited by marketing. The founder writes it personally.
A two-day cooling-off window between draft and send is recommended.

---

## Standard structure (≤ 800 words total)

### 1. The headline (1–2 sentences)

What was the single most important thing this month? Good or bad. No spin.

### 2. The numbers (one paragraph + a small table)

```
| Metric                | This month | vs last month | Notes |
|-----------------------|------------|----------------|-------|
| MRR                   |            |                |       |
| Paid customers        |            |                |       |
| New signups           |            |                |       |
| Activation rate       |            |                |       |
| Net Revenue Retention |            |                |       |
| Cash runway (months)  |            |                |       |
```

Round to 2 significant figures. Never publish without these six. If a number
went the wrong way, **say so first**.

### 3. What we shipped

3–6 bullets, each ≤ 1 line, with a link to the relevant page if public.
Skip internal refactors unless they unlocked something the user can feel.

### 4. What we broke (or got wrong)

The hardest section to write. List one to three things that didn't work:

- A feature we shipped and pulled back.
- A goal we missed.
- A customer-impacting incident (with link to post-mortem on `/trust/incidents/...`).

If there is genuinely nothing to write here for the month, default to "we took
the safe path and learned little — that's a problem too" and explain.

### 5. What we're working on next

3–5 bullets pointing at the public roadmap (`/roadmap` or GitHub Projects).
Tag each one with an honest confidence ("ship by mid-month / late / TBD").

### 6. Asks

One or two specific things the reader can help with:

- "We're looking for X" — intros, hires, beta testers.
- "Reply to this email if Y" — feedback loops.

### 7. Sign-off

Real name, real title, optional photo.

---

## Tone rules

- **Plain Arabic by default**, English version optional.
- No buzzwords ("synergy", "leverage", "AI-powered" used as adjective).
- No emojis except a single trailing 🌱 if you want one signature touch.
- Numbers must reconcile with the public dashboards on `/admin/costs` (for
  cost-side numbers) and the published KPI table on `/about`.
- Never apologize for ugly numbers — explain them.

---

## Distribution checklist

- [ ] Drafted in `docs/founders-letter/YYYY-MM.md`.
- [ ] Reviewed by one teammate for accuracy of numbers (no editing of voice).
- [ ] Published on `/blog/founders-letter/YYYY-MM`.
- [ ] Sent to subscribers list (Substack / Newsletter API).
- [ ] Posted as LinkedIn long-form by founder.
- [ ] Pinned on X / Threads with thread summary.
- [ ] Logged in `analytics_events` with event `founders_letter_published`.

---

## First letter (kick-off, May 2026) — outline only

> **Headline:** "We are 6 months in. Here is everything we got right and wrong."
>
> **Numbers:** publish baseline (even if MRR is small). Establishes the
> precedent that we share regardless of the result.
>
> **Shipped:** 16-agent platform · governance layer · Daily Brief beta · First-100 lifetime program.
>
> **Broke:** specific list of bugs that hit ≥ 1 % of users in last 30 days.
>
> **Next:** Anthropic fallback cutover · WhatsApp BSP · 5 English landing pages · 1 distribution partner signed.
>
> **Asks:** intros to STC Ventures, MEVP, Algebra; senior Customer Success
> candidate based in Cairo or Riyadh.

That precedent unblocks every later letter.

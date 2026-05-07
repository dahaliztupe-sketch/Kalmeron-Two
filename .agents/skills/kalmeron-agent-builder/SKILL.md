---
name: kalmeron-agent-builder
description: Add or extend a Kalmeron agent end-to-end. Use when creating a new agent, route, page, prompt, registry entry, or runtime skill mapping for the platform.
---

# Kalmeron Agent Builder

## When to Use
- When the user asks to add a new agent, workflow, or specialized AI capability.
- When wiring an agent into prompts, registry maps, UI pages, or API routes.
- When creating or updating runtime skill mappings for Kalmeron agents.

## Instructions
- Start from the agent's purpose, inputs, outputs, and risk level.
- Reuse existing platform patterns instead of inventing new ones.
- Update all required layers together:
  - agent prompt
  - agent implementation
  - registry / routing
  - UI page if needed
  - documentation or system card if relevant
- Keep Arabic-first behavior and explicit fallback handling.
- For anything stateful, security-sensitive, or external-facing, verify authorization and rate limiting.
- Prefer small, composable tools over one large opaque agent.
- If the agent depends on knowledge or skills, map them explicitly in the runtime registry.

## 7-Phase Agent Build Guide

### Phase 1 — Define Purpose and Contract
- State the agent's single responsibility in one sentence.
- Define inputs (user message, context, tool calls) and outputs (structured response, side effects).
- Classify risk level: read-only / stateful / external-facing.

### Phase 2 — Place the UI Route (read `kalmeron-route-guide` skill)
Before creating any page file:
- Determine whether the page belongs in `app/(dashboard)/` (auth + sidebar) or a standalone location.
- Add the route entry to `src/lib/navigation.ts` (NAV_SECTIONS) so the sidebar link appears.
- Wrap the page JSX in `<AppShell>` — the dashboard layout does NOT render it automatically.
- See `.agents/skills/kalmeron-route-guide/SKILL.md` for the full decision tree and common mistakes.

### Phase 3 — Wire Firestore Data (read `kalmeron-firestore-patterns` skill)
For any agent page or API route that reads or writes Firestore:
- Every list query must include `where("userId", "==", uid)` **and** `limit(N)`.
- Use the client SDK (`db` from `@/src/lib/firebase`) for client-side reads/writes.
- Use the Admin SDK (`adminDb` from `@/src/lib/firebase-admin`) in `app/api/` routes.
- See `kalmeron-firestore-patterns` for the full import contracts and mandatory query rules.
- Never write to server-only collections (`api_keys`, `webhooks`, `fawry_orders`, etc.) from the client.
- See `.agents/skills/kalmeron-firestore-patterns/SKILL.md` for the mandatory query template and five annotated collection examples.

### Phase 4 — Add i18n Strings (read `kalmeron-i18n-workflow` skill)
For any new UI text in the agent's page or components:
- Add all strings to **both** `messages/ar.json` **and** `messages/en.json` atomically — never update only one file.
- Follow the `Namespace.Component.element` key naming convention.
- Use `useTranslations("Namespace")` in client components, `getTranslations("Namespace")` (awaited) in RSC.
- Run the pre-submission checklist before committing.
- See `.agents/skills/kalmeron-i18n-workflow/SKILL.md` for the full workflow, usage examples, and error table.

### Phase 5 — Implement Agent Logic
- Write the prompt in `src/ai/agents/<agent-name>/prompt.ts`.
- Implement tool functions in `src/ai/agents/<agent-name>/tools.ts`.
- Register the agent in the routing/registry map.
- Validate all external API calls with proper error handling and fallbacks.

### Phase 6 — Create the API Route
- Place the route at `app/api/<feature>/route.ts`.
- Apply auth (`requireAuth: true`) and rate limiting.
- Never trust client-supplied `userId` — always derive it from the verified token.

### Phase 7 — Verify and Polish
- TypeScript: `npx tsc --noEmit` must return zero errors.
- ESLint: `eslint . --max-warnings=0` must return zero warnings.
- Confirm the sidebar link appears and navigates correctly.
- Confirm unauthenticated users are redirected (not 500'd).
- Confirm all new strings appear in both `ar.json` and `en.json`.

## Output Checklist
- [ ] Agent purpose is clear and single-responsibility
- [ ] Inputs and outputs are explicit
- [ ] Route placed in the correct zone (`(dashboard)/` vs. standalone)
- [ ] Sidebar nav entry added to `src/lib/navigation.ts`
- [ ] Firestore queries use `userId` scope + `limit()`
- [ ] i18n strings in both `ar.json` and `en.json`
- [ ] API route uses auth + rate limiting
- [ ] Registry/routing updated
- [ ] Risk and permissions considered
- [ ] No placeholder/demo behavior in production paths
- [ ] TypeScript: zero errors
- [ ] ESLint: zero warnings

---
name: pro-workflow
description: Professional development workflow for Kalmeron AI. Covers the session start protocol, quality gates, parallel execution patterns, change management, and verification steps. Use at the start of any development session or before large refactors.
---

# Pro Workflow Skill — Kalmeron AI

A structured, repeatable development workflow that catches errors early, avoids regressions, and keeps the codebase clean.

## Session Start Protocol

Run every session (in order):

```bash
# 1. Orient with OpenWolf memory (saves ~30K tokens)
bash .wolf/hooks/session-start.sh

# 2. Check codebase health
npx tsc --noEmit        # Must be 0 errors
npm run lint            # Must be 0 warnings

# 3. Understand current state
git status              # What's been changed
git log --oneline -5    # Recent context
```

## Development Loop

For every feature or fix, follow this loop:

```
Plan → Read → Edit → TypeCheck → Verify → Commit
```

### 1. Plan (before touching code)
- Check `CLAUDE.md` for relevant rules
- Check `.wolf/cerebrum.md` for patterns that apply
- Check `.wolf/buglog.json` for known issues in the area

### 2. Read (targeted, not broad)
- Use grep to find the specific code to change
- Read only the files that need editing
- Check message files via grep, not full read

### 3. Edit (with conventions)
- All visible text via `t()` from `useTranslations()` — never hardcode Arabic
- Firestore queries: always `.where("userId","==",uid)` + `.limit()`
- New pages: check route conflict (app/ vs app/(dashboard)/)

### 4. TypeCheck (mandatory)
```bash
npx tsc --noEmit 2>&1 | head -20
```
If errors: fix before proceeding. Never commit with TypeScript errors.

### 5. Verify (before marking done)
```bash
npm run lint            # 0 warnings required
npx tsc --noEmit        # 0 errors required
bash .wolf/hooks/pre-commit.sh   # All gates
```

### 6. Commit (with memory update)
```bash
bash .wolf/hooks/session-end.sh "What was accomplished"
git add -A && git commit -m "feat: description"
```

## Quality Gates

All gates must pass before marking any task complete:

| Gate | Command | Threshold |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | 0 errors |
| ESLint | `npm run lint` | 0 warnings |
| i18n check | grep for hardcoded Arabic | 0 occurrences |
| Route conflicts | pre-commit.sh | 0 conflicts |

## Parallel Execution Patterns

When multiple independent files need editing:

```
✅ DO: Edit multiple files in the same tool response
   - Edit messages/ar.json AND messages/en.json simultaneously  
   - Edit page.tsx AND route.ts simultaneously

❌ DON'T: Edit files sequentially when they're independent
   - Don't wait for ar.json edit to finish before editing en.json
```

When reading multiple files:
```
✅ DO: Batch independent reads into one tool call
   - Read page.tsx + route.ts + messages in parallel

❌ DON'T: Read files one by one when you need multiple files
```

## Change Management

### Before a large refactor:
1. Document the change in `cerebrum.md` (what and why)
2. TypeCheck baseline: `npx tsc --noEmit` must pass first
3. Make the change incrementally (one file group at a time)
4. TypeCheck after each group

### Before adding a new page:
1. Check: `find app -name "page.tsx" -path "*your-route*"` — no conflict
2. Verify route group: `(dashboard)` vs. root `app/`
3. Check middleware.ts — does the route need auth?

### Before adding i18n keys:
1. `grep "YourNamespace" messages/ar.json` — does namespace exist?
2. Add to both `ar.json` and `en.json` in the same edit
3. Use `useTranslations("Namespace")` in the component

## Error Recovery Protocol

When something breaks:
1. Check `.wolf/buglog.json` — has this happened before?
2. Check `CLAUDE.md` — is there a known pattern?
3. Check cerebrum.md — is there a documented decision?
4. If new error: fix it, then log to buglog via `learn-from-error.sh`

## Kalmeron Stack-Specific Gotchas

| Area | Common Mistake | Correct Pattern |
|---|---|---|
| Firestore | Missing userId filter | Always `.where("userId","==",uid).limit(n)` |
| i18n | Hardcoded Arabic in JSX | `t("key")` via `useTranslations` |
| Routes | Duplicate page.tsx | Check app/ AND app/(dashboard)/ |
| TypeScript | Framer Motion types | `ease: "easeOut" as const` in Variants |
| useEffect | Direct setState call | Wrap in `async function run() { setState() }` |
| Sandbox npm | npm install in root | Always `cd artifacts/mockup-sandbox && npm install` |
| FastAPI ports | Port 5000 assumed | 8000=PDF, 8008=Calc, 8099=Embed, 8080=LLM |

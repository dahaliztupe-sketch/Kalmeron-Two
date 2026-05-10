---
name: parallelization
description: Patterns for running multiple operations in parallel to maximize speed and minimize session duration. Use when editing multiple independent files, running multiple searches, or coordinating multiple tasks that don't depend on each other's outputs.
---

# Parallelization Skill

Run independent operations simultaneously to maximize throughput and minimize session duration.

## The Core Rule

**If two tool calls don't need each other's output, run them in the same response.**

```
Independent = can run in parallel
Dependent   = must run sequentially
```

## Parallel Patterns

### Pattern 1: Multi-file Edits
When editing files that don't depend on each other:
```
✅ In one response:
  - Edit messages/ar.json (add new keys)
  - Edit messages/en.json (add translations)
  - Edit app/page.tsx (use the new keys)

❌ Wasteful:
  - Response 1: Edit messages/ar.json
  - Response 2: Edit messages/en.json
  - Response 3: Edit app/page.tsx
```

### Pattern 2: Multi-file Reads
When you need content from multiple independent files:
```
✅ In one response:
  - Read app/(dashboard)/billing/page.tsx
  - Read app/api/billing/route.ts
  - Read messages/ar.json (section: grep)

❌ Wasteful:
  - Response 1: Read billing page
  - Response 2: Read billing API (after reading page)
```

### Pattern 3: Search + Read
```
✅ In one response:
  - grep for "BillingCard" in components/
  - grep for "useBilling" in hooks/
  - Read specific file you already know you need
```

### Pattern 4: i18n + Component Edit
When adding a new feature with text:
```
✅ Batch all at once:
  - Add keys to messages/ar.json
  - Add keys to messages/en.json
  - Edit the component to use t("key")
  - Edit the API route if needed
```

## Dependency Analysis — Kalmeron Specifics

### Always independent (run in parallel):
- `messages/ar.json` and `messages/en.json`
- Multiple page components in different routes
- Multiple API route files
- Registry.ts updates and SKILL.md updates
- TypeScript check and lint check

### Must be sequential:
- Create a type → use it in a component (type must exist first)
- Create an API route → test it (route must deploy first)
- Fix a TypeScript error → run tsc again (fix must be applied first)
- Read a file's current content → edit it (must read before editing)

## SAST Parallel Execution

The sast-orchestrator skill runs 13 security checks. For maximum speed, group by scan type:

**Batch 1** (input validation — no dependencies between):
- SQL Injection check
- XSS check
- SSTI check
- Path Traversal check

**Batch 2** (auth & access — no dependencies between):
- Missing Auth check
- IDOR check
- Broken Auth check
- JWT check

**Batch 3** (network & file — no dependencies between):
- SSRF check
- File Upload check
- RCE check
- XXE check
- GraphQL check

Run Batch 1, 2, 3 as separate parallel rounds (each batch can be parallelized internally; batch 2 can start without waiting for batch 1).

## Async Subagent Patterns

For research tasks that take time:
```
✅ Start research + continue coding:
  - Launch: explore("How does Fawry payment flow work?") [async]
  - Continue: Read/edit files while research runs
  - Later: Wait for research result
  - Then: Implement based on findings

❌ Wasteful:
  - Response 1: Ask research question
  - Wait for full answer
  - Response 2: Start implementation
```

## Speed Benchmarks

| Operation | Sequential | Parallel | Savings |
|---|---|---|---|
| Edit ar.json + en.json | 2 responses | 1 response | 50% |
| Add 3 i18n keys + use in component | 4 responses | 1 response | 75% |
| Read 5 files for context | 5 responses | 1 response | 80% |
| Run tsc + lint | 2 responses | 1 response | 50% |
| Run 13 SAST checks | 13 responses | 3 batches | 77% |

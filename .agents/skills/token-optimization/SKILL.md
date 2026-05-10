---
name: token-optimization
description: Strategies for reducing token usage in Claude sessions. Use when approaching context limits, loading large codebases, or wanting faster/cheaper sessions. Covers anatomy-first reading, targeted grep over full-file reads, and context window management.
---

# Token Optimization Skill

Maximize quality while minimizing token consumption in every session.

## Core Principle

**Read anatomy first, grep second, read files third.**

The `.wolf/anatomy.md` file contains a curated map of the entire codebase. Reading it costs ~2K tokens versus ~350K to explore files ad-hoc.

## Session Start Protocol

1. Read `CLAUDE.md` (~2K tokens) — rules, patterns, critical reminders
2. Read `.wolf/anatomy.md` (~3K tokens) — project structure map
3. Read `.wolf/cerebrum.md` (~4K tokens) — accumulated knowledge
4. Grep for specific patterns rather than reading full directories
5. Read only the specific files you need to change

**Savings: ~30K tokens per session vs. ad-hoc exploration**

## Token-Saving Patterns

### Instead of reading entire directories
```bash
# ❌ Expensive: reads 50+ files
ls app/(dashboard)/ → read each page.tsx

# ✅ Cheap: targeted search
grep -rn "useTranslations" app/(dashboard)/cash-runway/ --include="*.tsx"
```

### Instead of reading full registry
```bash
# ❌ Expensive
read: src/lib/agent-skills/registry.ts (800+ lines)

# ✅ Cheap: find what you need
grep -n "cto_agent\|finance_agent" src/lib/agent-skills/registry.ts
```

### Instead of reading all message files
```bash
# ❌ Expensive
read: messages/ar.json (2000+ lines)

# ✅ Cheap: find the namespace
grep -A 20 '"CashRunway"' messages/ar.json
```

## Context Window Management

### When to use the wolf hooks
- **session-start**: Always — orients you in 200 tokens instead of 30K
- **memory-persist**: When you discover a new pattern worth keeping
- **learn-from-error**: When a bug is resolved and lessons should be saved
- **session-end**: When wrapping up significant work

### File size awareness

| File | Approx tokens | Strategy |
|---|---|---|
| `messages/ar.json` | ~12K | Use grep, read specific namespace |
| `src/lib/agent-skills/registry.ts` | ~8K | Use grep for specific agent |
| `app/(dashboard)/**/page.tsx` | ~3K each | Read only file you're changing |
| `SKILL.md` files | ~2K each | Load only when skill is relevant |
| `.wolf/anatomy.md` | ~3K | **Always read first** |

## Kalmeron-Specific Token Traps

1. **`messages/ar.json` + `messages/en.json`**: These grow every session. Use grep to check if a key exists before reading the full file.
2. **`registry.ts`**: 800+ lines. Grep for the specific agent rather than reading it all.
3. **`app/(dashboard)/`**: 30+ pages. Let anatomy.md tell you which file to open.
4. **`.agents/skills/`**: 120+ SKILL.md files. Only load the skill that's relevant to the current task.

## Weekly Token Budget Review

Check `.wolf/token-ledger.json` to see if the project is trending over 500K tokens per session.

If sessions consistently exceed 350K tokens:
1. Run `.wolf/hooks/scan-anatomy.sh` to update estimates
2. Review anatomy.md for stale information
3. Archive old cerebrum entries to `cerebrum-archive.md`

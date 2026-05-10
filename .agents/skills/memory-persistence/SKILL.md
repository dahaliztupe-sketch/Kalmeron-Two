---
name: memory-persistence
description: Cross-session memory management for Claude agents. Use when finishing a significant work session, discovering a repeating bug pattern, establishing a new code convention, or wanting learnings to persist across sessions. Works with the .wolf/ memory system.
---

# Memory Persistence Skill

Preserve important discoveries and decisions across Claude sessions.

## The .wolf/ Memory System

```
.wolf/
├── anatomy.md          ← Project structure map (curated, not auto-generated)
├── cerebrum.md         ← Accumulated cross-session knowledge  
├── buglog.json         ← Documented bugs with lessons learned
├── token-ledger.json   ← Token budget tracking
└── hooks/
    ├── session-start.sh    ← Run at session start
    ├── session-end.sh      ← Run at session end  
    ├── pre-commit.sh       ← Quality gates before commit
    ├── learn-from-error.sh ← Log a new bug/learning
    ├── memory-persist.sh   ← Append a learning to cerebrum
    └── scan-anatomy.sh     ← Update token estimates
```

## When to Persist Memory

### Always persist when:
- A bug is fixed that took >30 minutes to diagnose
- A non-obvious code pattern is established
- A "gotcha" or architectural constraint is discovered
- A dependency or API behavior is non-obvious

### Persist to cerebrum.md:
For patterns, decisions, and architectural knowledge.

```bash
bash .wolf/hooks/memory-persist.sh "Pattern Title" "What was learned"
```

Or manually append to `cerebrum.md`:
```markdown
### N. Pattern Title
**القرار/الاكتشاف**: What was established and why.
**مكتشَف في**: 2026-05-10
```

### Persist to buglog.json:
For repeating bugs, tricky errors, and diagnostic lessons.

```bash
bash .wolf/hooks/learn-from-error.sh
```

## Reading Memory Efficiently

### Session start (mandatory):
```
1. Read CLAUDE.md         — rules + quick reference
2. Read .wolf/anatomy.md  — project map
3. Read .wolf/cerebrum.md — knowledge base
```

### Finding specific learnings:
```bash
# Search for a pattern in cerebrum
grep -i "firestore\|i18n\|useEffect" .wolf/cerebrum.md

# Find bugs related to a component
grep -i "billing\|fawry\|stripe" .wolf/buglog.json
```

## Anatomy.md Update Protocol

Update `.wolf/anatomy.md` when:
- A new major page or feature area is added (`app/(dashboard)/new-feature/`)
- A new FastAPI worker is deployed
- Significant components are refactored or renamed
- The agent skills registry gains major new coverage

Update format: add/edit the relevant section, update the token estimate if needed.

## Kalmeron-Specific Memory Conventions

| Memory Type | Location | Format |
|---|---|---|
| API behavior discoveries | `cerebrum.md` | Section with key pattern |
| Firestore schema facts | `cerebrum.md` | Collection path + field names |
| TypeScript gotchas | `cerebrum.md` | Error pattern + fix |
| ESLint rule violations | `buglog.json` | BUG-XXX with lesson |
| Security findings | `buglog.json` | Severity + remediation |
| Route conflicts | `cerebrum.md` | Which path is canonical |
| i18n key conventions | `cerebrum.md` | Namespace.key format |

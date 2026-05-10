---
name: openwolf-memory
description: Token-efficient project memory system using project anatomy and cumulative cerebrum files. Use at the start of every session to orient quickly, save ~80% of tokens typically spent on project exploration, and maintain context across sessions. Read .wolf/anatomy.md and .wolf/cerebrum.md before exploring individual files.
---

# OpenWolf Memory System for Kalmeron

A lightweight, token-efficient memory system inspired by OpenWolf. No npm package required — just structured files.

## Session Start Protocol

**At the beginning of EVERY session, do this:**

```
1. READ: CLAUDE.md                    ← project rules, critical patterns
2. READ: .wolf/anatomy.md             ← project structure map (saves 20K tokens)
3. READ: .wolf/cerebrum.md            ← accumulated knowledge (saves 15K tokens)
4. CHECK: .wolf/buglog.json           ← known bugs (prevents duplicate work)
5. THEN: explore specific files as needed
```

This saves approximately 30-50K tokens per session by avoiding redundant exploration.

## Token Budget Awareness

| Action | Token Cost | Alternative |
|---|---|---|
| Read full project file tree | ~5K tokens | Read anatomy.md (~1K) |
| Explore app/ directory | ~15K tokens | Read anatomy.md app section |
| Understand agent system | ~8K tokens | Read CLAUDE.md agent section |
| Find a bug pattern | ~10K tokens | Check buglog.json first |
| Understand skills system | ~12K tokens | Read registry.ts + CLAUDE.md |

**Target: <200K tokens per session** (see `.wolf/token-ledger.json` for tracking)

## Anatomy File Structure

`.wolf/anatomy.md` contains:
- Token budget by directory
- Full app router structure
- Component hierarchy
- API route inventory
- Known issues & solutions

Update it when you:
- Add new pages or routes
- Restructure directories
- Change major architecture

```bash
# How to update anatomy.md
# Just edit the file manually when you make structural changes
# No scanner needed — this is a living document
```

## Cerebrum File Usage

`.wolf/cerebrum.md` contains:
- Technical decisions (why things are the way they are)
- User preferences discovered over time
- Recurring patterns (established best practices)
- Anti-patterns (mistakes to avoid)

**Add to cerebrum.md when you:**
- Fix a bug that took >30 min to debug
- Discover a non-obvious architectural decision
- Learn a user preference
- Establish a new code pattern

```markdown
## New Learning Template
### N. [Learning Title]
**القرار/الاكتشاف**: [what was learned]
**السبب**: [why it matters]
**التأثير**: [where it applies]
**مكتشَف في**: [session date]
```

## Bug Log Protocol

`.wolf/buglog.json` — Add entries when:
- A bug is discovered AND fixed
- A pattern of bugs is identified
- A CVE is found and remediated

```json
{
  "id": "BUG-NNN",
  "title": "Short description",
  "severity": "critical|high|medium|low",
  "status": "open|resolved|pattern",
  "discoveredAt": "YYYY-MM-DD",
  "file": "path/to/file.ts",
  "lesson": "One-sentence takeaway to prevent recurrence"
}
```

## Token Ledger

`.wolf/token-ledger.json` — Track token usage:
- Updated manually after complex sessions
- Threshold warning: 500K tokens/session
- Review weekly for optimization opportunities

## .gitignore Policy

```gitignore
# OpenWolf memory — commit these (shared team knowledge)
# .wolf/anatomy.md    ← always commit
# .wolf/cerebrum.md   ← always commit
# .wolf/buglog.json   ← always commit

# Don't commit these (session-specific)
.wolf/token-ledger.json   ← optional, session data
.wolf/.session-*          ← temporary session files
```

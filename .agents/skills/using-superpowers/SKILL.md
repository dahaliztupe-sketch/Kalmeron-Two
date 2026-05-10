---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

Superpowers skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
2. **Superpowers skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

If CLAUDE.md, GEMINI.md, or AGENTS.md says "don't use TDD" and a skill says "always use TDD," follow the user's instructions. The user is in control.

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Never use the Read tool on skill files.

**In Copilot CLI:** Use the `skill` tool. Skills are auto-discovered from installed plugins. The `skill` tool works the same as Claude Code's `Skill` tool.

**In Gemini CLI:** Skills activate via the `activate_skill` tool. Gemini loads skill metadata at session start and activates the full content on demand.

**In other environments:** Check your platform's documentation for how skills are loaded.

## Platform Adaptation

Skills use Claude Code tool names. Non-CC platforms: see `references/copilot-tools.md` (Copilot CLI), `references/codex-tools.md` (Codex) for tool equivalents. Gemini CLI users get the tool mapping loaded automatically via GEMINI.md.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "About to EnterPlanMode?" -> "Already brainstormed?";
    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** (frontend-design, mcp-builder) - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.

---

## Available Skills Reference (Kalmeron — 2026-05-10)

**Total: ~128 skills** across categories. Key categories:

### Session Start (Always Read First)
- `openwolf-memory` — start every session with .wolf/anatomy.md + cerebrum.md
- `token-optimization` — read anatomy first, save ~30K tokens per session
- `memory-persistence` — how to update .wolf/ memory files and hooks
- `CLAUDE.md` (root) — project rules, patterns, architecture

### OpenWolf Hooks (.wolf/hooks/)
- `session-start.sh` — orient in 200 tokens, surface bugs/rules
- `session-end.sh` — capture learnings before closing
- `pre-commit.sh` — quality gates: tsc + i18n + route conflicts
- `learn-from-error.sh` — log a new bug to buglog.json
- `memory-persist.sh` — append a learning to cerebrum.md
- `scan-anatomy.sh` — refresh token estimates in anatomy.md

### Security (SAST — Run before releases)
- `sast-orchestrator` — runs all 13 SAST skill checks in parallel
- `sast-sql-injection`, `sast-xss`, `sast-rce`, `sast-ssrf`, `sast-idor`
- `sast-xxe`, `sast-ssti`, `sast-jwt`, `sast-path-traversal`, `sast-file-upload`
- `sast-broken-auth`, `sast-missing-auth`, `sast-graphql`
- CI gate: `.github/workflows/sast-skill.yml` (auto-runs on app/api/* changes)

### Infrastructure (VoltAgent-style)
- `firebase-patterns` — Firestore/Auth/Storage (Kalmeron-specific)
- `vercel-deployment` — Next.js deployment & optimization
- `stripe-integration` — Payment integration (Stripe + Fawry context)
- `auth0-patterns` — Enterprise SSO alternative to Firebase Auth
- `sentry-monitoring` — Error tracking & performance

### Professional Workflow (ECC-inspired)
- `pro-workflow` — full development loop: plan→read→edit→check→verify→commit
- `parallelization` — batch independent operations, SAST parallel patterns
- `verification-loops` — evidence before assertions, run commands then report
- `token-optimization` — anatomy-first reading, targeted grep strategies
- `memory-persistence` — .wolf/ memory system, when and what to persist

### Kalmeron-Specific
- `kalmeron-firestore-patterns` — Mandatory Firestore patterns (userId scoping, limit)
- `kalmeron-i18n-workflow` — i18n mandatory workflow (ar.json + en.json)
- `kalmeron-route-guide` — Route placement (dashboard vs root app/)
- `kalmeron-agent-builder` — Adding/extending agents
- `kalmeron-ui-polish` — UI quality for Arabic-first screens

### Process & Workflow
- `brainstorming` — before any creative/feature work
- `systematic-debugging` — before fixing bugs
- `verification-before-completion` — before claiming work is done
- `writing-plans` — for multi-step tasks
- `tdd` — test-driven development
- `subagent-driven-development` — parallel subagent execution

### C-Suite Advisory (34 skills)
- `c-level-advisor/chief-of-staff` — orchestration entry point
- `c-level-advisor/board-meeting` — structured multi-role deliberation
- Individual advisors: `ceo`, `cto`, `cfo`, `coo`, `cmo`, `clo`, `chro`, `cso`

### Egyptian Business Seeds (17)
- `kalmeron-seeds/ceo-egypt`, `cto-egypt`, `cfo-egypt`, etc.

### Product & Design
- `impeccable` — UI/UX mastery
- `frontend-design` — production-grade frontend
- `product-skills/*` — 15 PM toolkit skills
- `ux-audit` — walkthrough-based UX testing

### Finance
- `finance-skills/financial-analyst`
- `finance-skills/saas-metrics-coach`
- `finance-skills/business-investment-advisor`

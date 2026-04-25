# 0004 — Conventional Commits + Lightweight In-House Validator

- **Status:** Accepted
- **Date:** 2026-04-25
- **Deciders:** Principal Platform Architect
- **Supersedes:** —

## Context

Until now commit messages on Kalmeron Two were free-form, which forced
`CHANGELOG.md` to be hand-curated and made automated release notes / agent
PR triage impossible. We need a strict, machine-checkable convention that
also works for AI agents (Replit Agent, Cursor, Windsurf) committing on our
behalf.

We considered three options:

1. **commitlint + husky.** Industry standard but adds two dev deps and a
   git-hook installer step that is awkward in Replit's ephemeral
   environments.
2. **No enforcement, just docs.** Cheapest, but agents will not follow it
   reliably.
3. **In-house dependency-free validator.** A 50-line Node script that
   enforces the same regex as commitlint's `@commitlint/config-conventional`
   subset we care about.

## Decision

We adopt **option 3**. `scripts/check-commit-message.mjs` validates commit
messages against the [Conventional Commits 1.0](https://www.conventionalcommits.org/)
spec restricted to the type set `{feat, fix, refactor, perf, docs, test,
chore, build, ci, style, revert}`. The script reads from a file path or
stdin; CI invokes it on the PR title; developers can opt-in to a local
`commit-msg` git hook (see `CONTRIBUTING.md`).

`CHANGELOG.md` continues to be hand-curated for the user-facing summary,
but Conventional Commits unblocks future automation (semantic-release,
agent-generated changelog drafts).

## Consequences

- ✅ Zero new dependencies, zero install friction.
- ✅ Same regex covers human + agent commits.
- ✅ CI gate is one node invocation.
- ⚠️ No automatic version bump yet — that requires a follow-up ADR if we
  ever want to publish semver releases of internal libraries.
- ⚠️ Local git hook is opt-in (must be set up per clone). Agents that
  commit through Replit's tooling go through the same script in CI.

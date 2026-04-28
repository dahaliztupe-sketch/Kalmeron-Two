# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < main  | :x:                |

We support the latest commit on `main`. Older releases receive security
updates only on a best-effort basis until the next tagged release.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via one of:

1. **GitHub private vulnerability reporting** (preferred) — go to the
   repository's *Security* tab and click *Report a vulnerability*.
2. **Email** — `security@kalmeron.com` with subject prefix `[SECURITY]`.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce (proof-of-concept code if possible).
- Affected file paths, endpoints, or services.
- Your suggested remediation, if any.

We will acknowledge your report within **72 hours** and aim to provide a
fix or mitigation within **14 days** for critical issues, **30 days** for
high severity, and **90 days** for medium/low severity.

## Disclosure Policy

We follow **coordinated disclosure**:

1. We confirm the vulnerability and assess impact.
2. We develop and test a fix in a private branch.
3. We release the fix and credit the reporter (unless anonymity is requested).
4. We publish a GitHub Security Advisory once users have had time to update.

## Security Hardening

This repository implements:

- All GitHub Actions pinned to immutable commit SHAs.
- Least-privilege `permissions:` blocks on every workflow.
- Static analysis: CodeQL, Semgrep, Trivy, gitleaks.
- Dependency review on every pull request.
- Dependabot for npm + pip + GitHub Actions.
- Container hardening: non-root `USER` in every Dockerfile.
- Prompt-injection defenses for LLM inputs (`src/lib/security/prompt-guard.ts`).
- Log injection mitigation (`src/lib/security/sanitize-log.ts`).
- Safe JSON-LD rendering (`src/lib/security/safe-json-ld.ts`).

## Out of Scope

- Findings only reproducible against `localhost` development builds.
- Self-XSS that requires the victim to paste payloads into DevTools.
- Missing security headers on assets served by third-party CDNs we do
  not control.
- Volumetric DoS that does not exploit a code-level flaw.

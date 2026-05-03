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
- Start from the agent’s purpose, inputs, outputs, and risk level.
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

## Output Checklist
- Agent purpose is clear
- Inputs and outputs are explicit
- Registry updated
- UI/route wired if needed
- Risk and permissions considered
- No placeholder/demo behavior in production paths

# `hooks/` — Custom React Hooks

Reusable client-side hooks. Each hook is a single file named `use<Name>.ts`.

## Conventions
- Hooks are Client-only — they access browser APIs, React state, or contexts.
- Name with the `use` prefix; export a single default named hook per file.
- Keep hooks small and focused; compose larger behaviors from smaller hooks.
- Document the contract: input args, return shape, side effects, cleanup.
- Add a corresponding `<name>.test.ts` file when the hook contains real logic.

## What belongs here
- `useDebounce`, `useThrottle`, `useMediaQuery`, `useLocalStorage`, etc.
- Auth helpers like `useUser`, `useSession`.
- Domain hooks like `useAgentRun`, `useChatStream`.

## What does **not** belong here
- Server-side data fetching → use Server Components or Server Actions.
- One-off logic used in a single component → keep it inline.

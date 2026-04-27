# `i18n/` — Internationalization

Configures `next-intl` for Arabic (default) and English. Translation
**values** live in [`../messages/`](../messages/), one JSON file per locale
(`ar.json`, `en.json`).

## Files
- `routing.ts` — defines locales, default locale, and pathname strategy.
- `request.ts` — runtime config that loads messages on the server per request.

## Conventions
- Keys are nested by feature (e.g. `agents.chat.send`), not by page.
- `ar.json` is the source of truth for the user-facing copy; `en.json` mirrors it.
- The diagnostics scanner (`npm run diag:gaps`) flags any key missing from a locale.
- Plurals and ICU MessageFormat are supported via `next-intl`.

## Adding a translation
1. Add the key to **all** locale files in `messages/`.
2. Use `useTranslations('namespace')` in a Client/Server Component.
3. Run `npm run diag:gaps` to confirm parity.

/**
 * Safe stringification for embedding JSON-LD inside an HTML <script> block.
 *
 * Plain `JSON.stringify(payload)` is unsafe inside `<script>` because the
 * payload could contain the substring `</script>` (or `<!--` / `-->`), which
 * would break out of the script element and enable XSS. We escape the
 * dangerous characters using JSON's `\uXXXX` form, which is byte-equivalent
 * for parsers but harmless to the HTML tokenizer.
 *
 * Reference: OWASP "Output Encoding for HTML script tags".
 */
export function sanitizeJsonLd(payload: unknown): string {
  return JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Backwards-compatible alias for the JSON-LD sanitizer. */
export const safeJsonLd = sanitizeJsonLd;

/**
 * Escape (sanitize) a string of (possibly untrusted) text for safe insertion
 * into HTML via `dangerouslySetInnerHTML`. Use this for any user/CMS-supplied
 * text before passing it through a transform that emits HTML (e.g. bold
 * markdown). This is an HTML-entity sanitizer; the resulting string is safe
 * to interpolate into element bodies but NOT into attribute values without
 * additional context-specific escaping.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Backwards-compatible alias for the HTML sanitizer. */
export const escapeHtml = sanitizeHtml;

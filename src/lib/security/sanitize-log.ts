/**
 * Sanitize untrusted values before writing them to logs.
 *
 * Mitigates CWE-117 (Log Injection) by:
 *  - stripping CR/LF/control characters (prevents fake log lines)
 *  - capping length so a malicious payload can't blow up the log line
 *  - coercing non-strings to a stable string form
 *
 * Use this for any value that originates from a request body, header,
 * query string, or other user-controlled source before passing it to
 * `console.log` / `console.error` / pino.
 */
const MAX_LOG_FIELD_LEN = 256;

export function sanitizeLogValue(value: unknown, maxLen = MAX_LOG_FIELD_LEN): string {
  let s: string;
  if (value === null || value === undefined) {
    s = String(value);
  } else if (typeof value === 'string') {
    s = value;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    s = String(value);
  } else {
    try {
      s = JSON.stringify(value);
    } catch {
      s = '[unserializable]';
    }
  }
  // Strip control chars (incl. \r \n \t) that could forge new log lines.
  s = s.replace(/[\u0000-\u001f\u007f]/g, ' ');
  if (s.length > maxLen) s = s.slice(0, maxLen) + '…';
  return s;
}

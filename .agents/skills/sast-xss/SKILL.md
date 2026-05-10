---
name: sast-xss
description: Detect Cross-Site Scripting (XSS) vulnerabilities in React/Next.js applications. Use when reviewing components that render user-generated content, dangerouslySetInnerHTML usage, URL handling, or DOM manipulation. Covers reflected, stored, and DOM-based XSS.
---

# SAST: Cross-Site Scripting (XSS) Detection

Scan for XSS vulnerabilities — OWASP A03:2021.

## What to Look For

### High Risk Patterns
```tsx
// ❌ VULNERABLE: dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userContent }} />
<div dangerouslySetInnerHTML={{ __html: req.query.message }} />

// ❌ VULNERABLE: eval() with user data
eval(userInput);
new Function(userCode)();

// ❌ VULNERABLE: unescaped URL params in href
<a href={router.query.redirect}>Click</a>

// ❌ VULNERABLE: innerHTML assignment
element.innerHTML = userData;
document.write(userInput);
```

### Safe Patterns
```tsx
// ✅ SAFE: text content (auto-escaped by React)
<div>{userContent}</div>

// ✅ SAFE: sanitized HTML (with DOMPurify)
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ SAFE: validated redirect URL
const safeUrl = url.startsWith('/') ? url : '/dashboard';
<a href={safeUrl}>Click</a>
```

## Scan Checklist

- [ ] No `dangerouslySetInnerHTML` with unsanitized user input
- [ ] All URL parameters validated before use in `href` / `src`
- [ ] No `eval()` / `new Function()` with user data
- [ ] `innerHTML` / `outerHTML` DOM assignments sanitized
- [ ] CSP headers configured (check `next.config.ts` headers)
- [ ] `next/link` used instead of raw `<a>` for internal navigation

## Next.js Specific Checks
- Check `app/api/*/route.ts` for reflected XSS in JSON responses (rare but possible with HTML content-type)
- Verify `next.config.ts` has proper `Content-Security-Policy` header
- Check `_app.tsx` or `layout.tsx` for unsafe script injection

## Severity Matrix
| Pattern | Severity |
|---|---|
| `dangerouslySetInnerHTML` + unsanitized user input | Critical |
| Open redirect via unvalidated URL | High |
| `eval()` with user data | Critical |
| Stored XSS via rich text editor | High |
| DOM-based XSS via `location.hash` | Medium |

## Remediation
1. Use React's built-in escaping (JSX text nodes)
2. Sanitize with DOMPurify before `dangerouslySetInnerHTML`
3. Validate and allowlist redirect URLs
4. Implement strict CSP headers in `next.config.ts`
5. Enable `X-XSS-Protection` and `X-Content-Type-Options` headers

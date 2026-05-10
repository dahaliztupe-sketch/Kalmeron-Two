---
name: sast-ssrf
description: Detect Server-Side Request Forgery (SSRF) vulnerabilities in Next.js API routes and backend services. Use when reviewing code that makes HTTP requests with user-controlled URLs, webhook handlers, URL preview features, or proxy endpoints.
---

# SAST: Server-Side Request Forgery (SSRF) Detection

Scan for SSRF vulnerabilities — OWASP A10:2021.

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: fetch with user-controlled URL
const response = await fetch(req.body.url);
const data = await fetch(req.query.webhookUrl);
const html = await fetch(`https://${userDomain}/sitemap.xml`);

// ❌ VULNERABLE: axios/got with user URL
import axios from 'axios';
await axios.get(userUrl);

// ❌ VULNERABLE: URL preview / OG fetcher
const meta = await fetchOgMeta(req.body.targetUrl);

// ❌ VULNERABLE: redirect following with internal targets
fetch(url, { redirect: 'follow' });
```

### Safe Patterns
```typescript
// ✅ SAFE: URL allowlist validation
const ALLOWED_DOMAINS = ['api.fawry.com', 'fcm.googleapis.com'];
const parsed = new URL(userUrl);
if (!ALLOWED_DOMAINS.includes(parsed.hostname)) throw new Error('Blocked');

// ✅ SAFE: block private IP ranges
import { isPrivateIP } from '@/lib/security/ssrf-guard';
if (isPrivateIP(parsed.hostname)) throw new Error('Private IP blocked');

// ✅ SAFE: disable redirects
fetch(url, { redirect: 'error' });
```

## Private IP Ranges to Block
```
127.0.0.0/8    (loopback)
10.0.0.0/8     (private)
172.16.0.0/12  (private)
192.168.0.0/16 (private)
169.254.0.0/16 (link-local / AWS metadata)
::1             (IPv6 loopback)
fd00::/8        (IPv6 private)
```

## Kalmeron-Specific Checks
- `app/api/billing/fawry/` — verify Fawry URL is hardcoded, not user-supplied
- Webhook endpoints — validate webhook sender domain
- Any "link preview" or URL-scraping feature

## Scan Checklist

- [ ] All outgoing HTTP requests use hardcoded or allowlisted URLs
- [ ] User-supplied URLs validated against domain allowlist
- [ ] Private IP ranges blocked before making requests
- [ ] No blind SSRF via error messages leaking internal info
- [ ] Redirect following disabled or strictly controlled

## Severity Matrix
| Pattern | Severity |
|---|---|
| Fetch with raw user URL | High |
| URL that can reach AWS metadata (169.254.169.254) | Critical |
| Webhook with unvalidated callback URL | High |
| Blind SSRF via DNS | Medium |

## Remediation
1. Allowlist external domains your app legitimately calls
2. Resolve and validate IP before connecting
3. Block RFC-1918 private ranges + 169.254.x.x
4. Disable HTTP redirects or validate each hop
5. Use dedicated egress proxy with allowlist enforcement

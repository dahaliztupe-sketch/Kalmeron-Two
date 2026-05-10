---
name: sast-broken-auth
description: Detect Broken Authentication vulnerabilities in Next.js middleware, API routes, and session management. Use when reviewing login flows, session validation, password handling, or token management. Covers session fixation, credential exposure, weak passwords, and account enumeration.
---

# SAST: Broken Authentication Detection

Scan for authentication flaws — OWASP A07:2021 (Identification and Authentication Failures).

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: credentials in URL
fetch(`/api/login?email=${email}&password=${password}`); // logged in server logs!

// ❌ VULNERABLE: session token in localStorage (XSS accessible)
localStorage.setItem('token', authToken);

// ❌ VULNERABLE: weak session ID generation
const sessionId = Math.random().toString(); // not cryptographically random

// ❌ VULNERABLE: password comparison timing attack
if (storedHash === inputHash) { ... } // use timingSafeEqual instead

// ❌ VULNERABLE: no rate limiting on login endpoint
// app/api/auth/login/route.ts with no rate limiting

// ❌ VULNERABLE: hardcoded admin credentials
if (password === 'admin123') { return true; }

// ❌ VULNERABLE: credential exposure in error messages
return NextResponse.json({ error: `User ${email} not found` }); // enumeration!
```

### Safe Patterns
```typescript
// ✅ SAFE: credentials in POST body (HTTPS)
fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// ✅ SAFE: HttpOnly, Secure, SameSite cookies
cookies().set('session', token, {
  httpOnly: true, secure: true, sameSite: 'lax', maxAge: 86400
});

// ✅ SAFE: cryptographically secure session ID
import { randomBytes } from 'crypto';
const sessionId = randomBytes(32).toString('hex');

// ✅ SAFE: constant-time comparison
import { timingSafeEqual } from 'crypto';
const safe = timingSafeEqual(Buffer.from(a), Buffer.from(b));

// ✅ SAFE: generic error messages (no enumeration)
return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
```

## Kalmeron-Specific Checks
- Firebase Auth handles most auth — verify Firebase rules are correct
- Check `src/lib/auth/session.ts` for session management
- API key generation in `app/(dashboard)/settings/api-keys/` — verify `randomBytes` used
- Webhook signing in `app/(dashboard)/settings/webhooks/` — verify HMAC-SHA256

## Scan Checklist

- [ ] Credentials never in URL query parameters
- [ ] Session tokens stored in HttpOnly cookies (not localStorage)
- [ ] Cryptographically secure random session IDs
- [ ] Rate limiting on authentication endpoints
- [ ] Generic error messages (no user enumeration)
- [ ] MFA available for sensitive operations
- [ ] Session invalidated on logout (server-side)
- [ ] Password hashing uses bcrypt/argon2 (not MD5/SHA1)

## Severity Matrix
| Pattern | Severity |
|---|---|
| Hardcoded credentials | Critical |
| Credentials in URL | High |
| Session in localStorage | High |
| No rate limiting on login | High |
| Timing attack in comparison | Medium |
| User enumeration via errors | Medium |

## Remediation
1. Use Firebase Auth or established auth library — don't roll your own
2. Store sessions in HttpOnly, Secure, SameSite cookies
3. Implement rate limiting on `/api/auth/*` routes
4. Return `401 Invalid credentials` for both wrong email AND wrong password
5. Use `crypto.randomBytes(32)` for all tokens and session IDs

---
name: sast-jwt
description: Detect JWT (JSON Web Token) vulnerabilities in authentication middleware and API routes. Use when reviewing token validation, session handling, or any code that parses/verifies JWTs. Covers algorithm confusion, none algorithm, weak secrets, and missing validation.
---

# SAST: JWT Vulnerability Detection

Scan for JWT implementation flaws — OWASP A02:2021 (Cryptographic Failures).

## What to Look For

### Critical Patterns
```typescript
// ❌ CRITICAL: accepting 'none' algorithm
jwt.verify(token, secret, { algorithms: ['HS256', 'none'] });

// ❌ CRITICAL: not specifying algorithm (algorithm confusion attack)
jwt.verify(token, publicKey); // if RS256 expected but HS256 sent with publicKey as secret

// ❌ CRITICAL: weak or hardcoded secret
const secret = 'secret';
const secret = '12345';
const secret = process.env.JWT_SECRET || 'fallback-secret'; // fallback is dangerous

// ❌ CRITICAL: not verifying token before using claims
const decoded = jwt.decode(token); // decode ≠ verify!
const userId = decoded.sub; // attacker controls this

// ❌ HIGH: no expiry validation
jwt.sign(payload, secret); // no expiresIn — token lives forever
```

### Safe Patterns
```typescript
// ✅ SAFE: explicit algorithm, no fallback secret
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET not configured');
const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

// ✅ SAFE: short-lived tokens
jwt.sign(payload, secret, { expiresIn: '15m', algorithm: 'HS256' });

// ✅ SAFE: Firebase ID tokens (Kalmeron uses this)
const decoded = await admin.auth().verifyIdToken(idToken);
```

## Kalmeron-Specific Notes
- Kalmeron uses Firebase Auth → Firebase SDK handles JWT verification internally
- Check `src/lib/auth/session.ts` and middleware for any custom JWT handling
- If custom JWTs are issued (e.g., for API keys), verify the above patterns

## Scan Checklist

- [ ] Algorithm explicitly specified in `jwt.verify()` — never allow 'none'
- [ ] `jwt.verify()` used (not `jwt.decode()`) for authentication
- [ ] JWT_SECRET loaded from environment — no hardcoded fallbacks
- [ ] Tokens have expiry (`expiresIn`)
- [ ] Token revocation strategy exists (blocklist or short TTL)
- [ ] Firebase ID tokens verified via `admin.auth().verifyIdToken()`

## Severity Matrix
| Pattern | Severity |
|---|---|
| Algorithm confusion (RS256→HS256) | Critical |
| `none` algorithm accepted | Critical |
| `jwt.decode()` used for auth | Critical |
| Hardcoded JWT secret | High |
| No token expiry | High |
| Missing algorithm specification | High |

## Remediation
1. Always specify `algorithms: ['HS256']` in verify options
2. Never use `jwt.decode()` for security decisions
3. Store secrets in environment variables with no defaults
4. Set `expiresIn: '15m'` for access tokens, `7d` for refresh tokens
5. Implement token rotation and revocation for sensitive operations

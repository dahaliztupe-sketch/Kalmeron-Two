---
name: auth0-patterns
description: Auth0 authentication patterns for Next.js App Router. Use when adding social login, enterprise SSO, multi-factor authentication, or when evaluating Auth0 as an alternative to Firebase Auth. Covers session management, role-based access, and machine-to-machine tokens.
---

# Auth0 Patterns for Next.js App Router

Official patterns from Auth0 engineering.

## Context for Kalmeron

Kalmeron currently uses **Firebase Auth**. Auth0 is relevant when:
- Adding enterprise SSO (SAML, LDAP) for B2B customers
- Requiring advanced MFA flows
- Needing fine-grained RBAC with permissions
- Integrating with existing enterprise identity providers

## Installation (if adding Auth0)
```bash
npm install @auth0/nextjs-auth0
```

## Configuration
```typescript
// auth0.config.ts
import { initAuth0 } from '@auth0/nextjs-auth0';
export const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
});
```

## Route Handler (App Router)
```typescript
// app/api/auth/[auth0]/route.ts
import { auth0 } from '@/lib/auth0';
export const GET = auth0.handleAuth({
  login: auth0.handleLogin({
    authorizationParams: { scope: 'openid profile email' },
  }),
});
```

## Session Access Pattern
```typescript
// Server Component
import { auth0 } from '@/lib/auth0';
export default async function Page() {
  const session = await auth0.getSession();
  if (!session) redirect('/api/auth/login');
  return <Dashboard user={session.user} />;
}

// API Route
export async function GET(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // session.user.sub — Auth0 user ID
  // session.user.email — user email
}
```

## Role-Based Access Control
```typescript
// Auth0 Action (set in Auth0 dashboard) — adds roles to ID token
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://kalmeron.ai/';
  const roles = event.authorization?.roles || [];
  api.idToken.setCustomClaim(`${namespace}roles`, roles);
};

// In Next.js — check roles
const session = await auth0.getSession();
const roles = session?.user['https://kalmeron.ai/roles'] as string[] || [];
if (!roles.includes('admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

## Machine-to-Machine Tokens (API-to-API)
```typescript
// Get M2M token for internal service calls
const { data } = await axios.post(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
  client_id: process.env.AUTH0_M2M_CLIENT_ID,
  client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
  audience: 'https://api.kalmeron.ai',
  grant_type: 'client_credentials',
});
const accessToken = data.access_token;
```

## Comparison: Firebase Auth vs Auth0 (Kalmeron context)

| Feature | Firebase Auth | Auth0 |
|---|---|---|
| Social login | ✅ Basic | ✅ 30+ providers |
| Arabic UI | ✅ RTL support | ⚠️ Limited |
| Egypt/MENA | ✅ Regional pricing | ⚠️ USD pricing |
| Enterprise SSO | ❌ | ✅ SAML/LDAP |
| Fine-grained RBAC | ❌ | ✅ |
| Current use in Kalmeron | ✅ Primary | ❌ |

**Recommendation**: Keep Firebase Auth as primary. Add Auth0 only for enterprise SSO tier.

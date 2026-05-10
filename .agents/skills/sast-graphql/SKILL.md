---
name: sast-graphql
description: Detect GraphQL-specific vulnerabilities including injection, introspection exposure, query depth attacks, and authorization bypasses. Use when reviewing any GraphQL API implementation or when the app consumes a GraphQL endpoint.
---

# SAST: GraphQL Security Detection

Scan for GraphQL-specific vulnerabilities — OWASP API Security Top 10.

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: introspection enabled in production
const server = new ApolloServer({
  schema,
  introspection: true, // exposes full schema to attackers
});

// ❌ VULNERABLE: no query depth limit
// Attacker can send: { user { friends { friends { friends { ... } } } } }

// ❌ VULNERABLE: no query cost/complexity limit
// Attacker can request massive data in a single query

// ❌ VULNERABLE: field-level injection
const query = `
  query { user(id: "${userId}") { ... } }  // injection in inline argument
`;

// ❌ VULNERABLE: batch query abuse
// GraphQL allows multiple operations — no rate limiting per-operation

// ❌ VULNERABLE: no authorization at resolver level
const resolvers = {
  Query: {
    users: () => User.findAll(), // no auth check in resolver!
  }
};
```

### Safe Patterns
```typescript
// ✅ SAFE: disable introspection in production
const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== 'production',
});

// ✅ SAFE: depth limiting
import depthLimit from 'graphql-depth-limit';
const server = new ApolloServer({
  validationRules: [depthLimit(5)],
});

// ✅ SAFE: resolver-level auth
const resolvers = {
  Query: {
    users: (_, __, context) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      if (context.user.role !== 'admin') throw new ForbiddenError('Not authorized');
      return User.findAll();
    }
  }
};

// ✅ SAFE: use variables (not inline string interpolation)
const query = `query GetUser($id: ID!) { user(id: $id) { ... } }`;
client.query({ query, variables: { id: userId } });
```

## Scan Checklist

- [ ] Introspection disabled in production (`NODE_ENV === 'production'`)
- [ ] Query depth limit configured (max 5-7 levels)
- [ ] Query complexity/cost limit configured
- [ ] All resolvers check authentication context
- [ ] Rate limiting per query operation
- [ ] Variables used instead of string interpolation in dynamic queries
- [ ] Subscription endpoints protected with auth

## Severity Matrix
| Pattern | Severity |
|---|---|
| Introspection in production | High |
| No depth limit (DoS) | High |
| Resolver without auth check | Critical |
| GraphQL injection via inline args | High |
| Batch query abuse (no rate limit) | Medium |

## Remediation
1. Disable introspection in production environments
2. Install `graphql-depth-limit` and set max to 5
3. Add authentication middleware that populates `context.user`
4. Check `context.user` in every resolver that returns sensitive data
5. Use persisted queries in production to prevent arbitrary query execution

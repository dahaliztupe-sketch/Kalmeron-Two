---
name: sast-sql-injection
description: Detect SQL Injection vulnerabilities in Next.js/Node.js/Python code. Use when reviewing API routes, database queries, or any user-input processing code. Identifies raw SQL concatenation, missing parameterization, ORM misuse, and second-order injection patterns.
---

# SAST: SQL Injection Detection

Scan for SQL Injection (SQLi) vulnerabilities — OWASP A03:2021.

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: string concatenation in query
const query = `SELECT * FROM users WHERE id = ${userId}`;
const query = "SELECT * FROM users WHERE email = '" + email + "'";

// ❌ VULNERABLE: template literal without parameterization
db.query(`DELETE FROM sessions WHERE token = ${req.body.token}`);

// ❌ VULNERABLE: dynamic ORDER BY / table names
db.query(`SELECT * FROM ${tableName} ORDER BY ${sortField}`);
```

### Safe Patterns
```typescript
// ✅ SAFE: parameterized queries
db.query('SELECT * FROM users WHERE id = $1', [userId]);
db.query('SELECT * FROM users WHERE email = ?', [email]);

// ✅ SAFE: ORM with proper escaping
prisma.user.findUnique({ where: { id: userId } });
```

## Scan Checklist

- [ ] All `db.query()` / `db.execute()` calls use parameterization
- [ ] No user input concatenated into SQL strings
- [ ] Dynamic identifiers (table/column names) validated against allowlist
- [ ] ORM raw query methods (`$queryRaw`, `$executeRaw`) use tagged templates or param arrays
- [ ] Stored procedures don't concatenate input

## Firestore Note (Kalmeron-specific)
Firestore is NoSQL — traditional SQLi doesn't apply. However check for:
- Unvalidated collection/document paths from user input
- Missing `.limit()` allowing data exfiltration

## Severity Matrix
| Pattern | Severity |
|---|---|
| Direct concatenation in WHERE clause | Critical |
| Dynamic table/column name from user | High |
| Raw ORM without parameterization | High |
| Second-order injection (stored then used) | Critical |

## Remediation
1. Always use parameterized queries or prepared statements
2. Validate and allowlist dynamic identifiers
3. Apply principle of least privilege on DB accounts
4. Enable query logging for anomaly detection

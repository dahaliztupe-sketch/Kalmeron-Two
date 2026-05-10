---
name: sast-path-traversal
description: Detect Path Traversal vulnerabilities in file handling code, API routes, and static file serving. Use when reviewing endpoints that read/write/delete files using user-supplied paths or filenames. Covers ../ sequences, null bytes, and encoding bypasses.
---

# SAST: Path Traversal Detection

Scan for Path Traversal (Directory Traversal) vulnerabilities — OWASP A01:2021.

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: user-controlled path in file operations
import { readFileSync } from 'fs';
const content = readFileSync(`./uploads/${req.params.filename}`);

// ❌ VULNERABLE: path.join doesn't prevent traversal alone
const filePath = path.join(__dirname, 'uploads', userFilename);
// If userFilename = '../../etc/passwd', path.join resolves it!

// ❌ VULNERABLE: directory listing with user input
const files = fs.readdirSync(`./data/${req.query.folder}`);

// ❌ VULNERABLE: unvalidated file deletion
fs.unlinkSync(`./uploads/${req.body.file}`);
```

### Safe Patterns
```typescript
// ✅ SAFE: resolve and verify prefix
import path from 'path';
const UPLOAD_DIR = path.resolve('./uploads');
const requested = path.resolve(UPLOAD_DIR, userFilename);
if (!requested.startsWith(UPLOAD_DIR + path.sep)) {
  throw new Error('Path traversal detected');
}
const content = readFileSync(requested);

// ✅ SAFE: allowlist filenames
const ALLOWED_FILES = ['report.pdf', 'invoice.xlsx'];
if (!ALLOWED_FILES.includes(userFilename)) throw new Error('Not allowed');

// ✅ SAFE: use database IDs instead of filenames
const file = await db.collection('files').doc(fileId).get();
const storagePath = file.data().path; // trusted, from DB
```

## Kalmeron-Specific Checks
- `app/api/user/avatar/route.ts` — verify upload path is confined to Firebase Storage
- `PDF Worker` (port 8000) — check FastAPI file handling endpoints
- Any endpoint that accepts `filename`, `path`, `file`, `dir` parameters

## Scan Checklist

- [ ] All file paths resolved with `path.resolve()` + `startsWith(baseDir)` check
- [ ] No raw user input used in `fs.*` calls
- [ ] Upload directories are outside the application root
- [ ] File extensions validated against allowlist
- [ ] Null bytes (`\0`) stripped from filenames
- [ ] URL-encoded traversal sequences (`%2e%2e%2f`) decoded and checked

## Severity Matrix
| Pattern | Severity |
|---|---|
| Read arbitrary file with `../` | Critical |
| Write to arbitrary path | Critical |
| Delete arbitrary file | Critical |
| List arbitrary directory | High |
| Source code disclosure via traversal | Critical |

## Remediation
1. Resolve path + check it starts with expected base directory
2. Use allowlists for filenames/extensions
3. Store files with UUID names (not user-supplied names)
4. Use cloud storage (Firebase Storage) — paths are managed by the service
5. Chroot or containerize file serving processes

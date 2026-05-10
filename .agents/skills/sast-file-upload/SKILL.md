---
name: sast-file-upload
description: Detect insecure file upload vulnerabilities in Next.js API routes and Firebase Storage handlers. Use when reviewing avatar upload, document upload, PDF processing, or any file ingestion endpoints. Covers file type validation, size limits, path safety, and malware vectors.
---

# SAST: Insecure File Upload Detection

Scan for file upload vulnerabilities — OWASP A04:2021 (Insecure Design).

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: no file type validation
const file = formData.get('file') as File;
await storage.upload(file); // any file type accepted!

// ❌ VULNERABLE: trust client-provided MIME type
if (file.type === 'image/png') { ... } // client can lie about MIME

// ❌ VULNERABLE: no file size limit
const buffer = await file.arrayBuffer(); // no size check — DoS!

// ❌ VULNERABLE: user-controlled filename in storage path
await storage.ref(`uploads/${file.name}`).put(buffer);
// Attacker can use '../' or overwrite existing files

// ❌ VULNERABLE: serving uploaded files without content-type enforcement
res.setHeader('Content-Type', req.headers['content-type']); // reflects client header
```

### Safe Patterns
```typescript
// ✅ SAFE: validate file signature (magic bytes), not just extension
const buffer = Buffer.from(await file.arrayBuffer());
const isPng = buffer[0] === 0x89 && buffer[1] === 0x50; // PNG magic

// ✅ SAFE: size limit
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_SIZE) throw new Error('File too large');

// ✅ SAFE: UUID filename (no user-controlled names)
import { randomUUID } from 'crypto';
const storagePath = `avatars/${session.user.id}/${randomUUID()}.jpg`;

// ✅ SAFE: set explicit content-type when serving
res.setHeader('Content-Type', 'image/jpeg');
res.setHeader('Content-Disposition', 'inline');
```

## Kalmeron-Specific Checks
- `app/api/user/avatar/route.ts` — verify UUID naming + size limit + image-only
- `PDF Worker` (port 8000) — verify PDF magic bytes validation
- Firebase Storage rules — check storage.rules for proper auth enforcement

## Scan Checklist

- [ ] File type validated by magic bytes (not just MIME/extension)
- [ ] File size limit enforced server-side
- [ ] UUID used for storage path (not user-supplied filename)
- [ ] Upload scoped to authenticated user directory (`avatars/${userId}/`)
- [ ] Antivirus/malware scanning for non-image uploads
- [ ] Firebase Storage rules restrict read/write to owner
- [ ] Content-Type header set explicitly when serving files

## Severity Matrix
| Pattern | Severity |
|---|---|
| Executable upload (.php, .js, .py) served | Critical |
| No size limit (DoS) | High |
| User-controlled filename/path | High |
| Reflected Content-Type (MIME sniffing) | Medium |
| SVG upload without sanitization | High |

## Remediation
1. Validate file magic bytes on server (never trust client MIME)
2. Allowlist accepted extensions AND verify magic bytes match
3. Generate UUID filenames — never use original filename
4. Scope storage paths to userId (`${userId}/${uuid}.jpg`)
5. Set explicit `Content-Type` and `X-Content-Type-Options: nosniff` when serving
6. For images: re-encode with Sharp/Canvas to strip metadata and malicious payloads

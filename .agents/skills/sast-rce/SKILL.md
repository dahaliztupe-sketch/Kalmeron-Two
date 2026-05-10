---
name: sast-rce
description: Detect Remote Code Execution (RCE) vulnerabilities in Node.js/Python backend code. Use when reviewing API routes that handle file paths, shell commands, code evaluation, or deserialization. Critical severity — always prioritize.
---

# SAST: Remote Code Execution (RCE) Detection

Scan for RCE vulnerabilities — OWASP A03:2021. **Highest priority — always fix.**

## What to Look For

### Critical Patterns (Node.js)
```typescript
// ❌ CRITICAL: shell command with user input
import { exec, execSync } from 'child_process';
exec(`convert ${userFilename} output.pdf`);       // command injection
execSync(`ffmpeg -i ${req.body.input} ...`);

// ❌ CRITICAL: eval with user input
eval(req.body.code);
vm.runInNewContext(userCode);

// ❌ CRITICAL: require() with user-controlled path
require(req.query.module);
import(userPath);

// ❌ CRITICAL: deserialize untrusted data
JSON.parse(userInput); // safe, but:
serialize.unserialize(cookie); // node-serialize — CVE-2017-5941
yaml.load(userYaml); // js-yaml safeLoad vs load
```

### Safe Patterns
```typescript
// ✅ SAFE: execFile with argument array (no shell)
import { execFile } from 'child_process';
execFile('convert', [sanitizedFilename, 'output.pdf']);

// ✅ SAFE: allowlist validation
const ALLOWED_MODULES = ['analytics', 'reports'] as const;
if (!ALLOWED_MODULES.includes(req.query.module)) throw new Error('Invalid');
```

## Scan Checklist

- [ ] No `exec()` / `execSync()` / `spawn()` with user-controlled input
- [ ] No `eval()` / `new Function()` / `vm.runInNewContext()` with user data
- [ ] No dynamic `require()` / `import()` with user-controlled paths
- [ ] Deserialization libraries verified (js-yaml uses `safeLoad`, not `load`)
- [ ] File path operations use `path.resolve()` + `startsWith(allowedDir)` check
- [ ] No server-side template engines with user-controlled templates

## Next.js / API Route Specific
- Check `app/api/` routes that accept file paths in body/query
- Verify `PDF Worker` (port 8000) and `Embeddings Worker` (port 8099) FastAPI routes
- Check `src/ai/agents/` for any dynamic code execution

## Severity Matrix
| Pattern | Severity |
|---|---|
| `exec()` with user input | Critical |
| `eval()` with user data | Critical |
| Dynamic `require()` | Critical |
| Unsafe YAML deserialization | High |
| Path traversal leading to RCE | Critical |

## Remediation
1. Use `execFile()` with argument arrays instead of `exec()` with shell strings
2. Never evaluate user-provided code
3. Use allowlists for any dynamic module loading
4. Use `yaml.safeLoad()` not `yaml.load()`
5. Apply principle of least privilege to process permissions

---
name: verification-loops
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs. Requires running verification commands and confirming output before making any success claims. Evidence before assertions always.
---

# Verification Loops Skill

Never claim success without running the commands to verify it.

## The Core Rule

**Evidence before assertions.** Run the verification, read the output, confirm it, then report.

```
❌ "TypeScript should be fine now" (no verification)
✅ Run: npx tsc --noEmit → read output → "Exit code 0, 0 errors" → report
```

## Standard Verification Checklist

Before marking any task complete, run all applicable checks:

### 1. TypeScript Gate
```bash
npx tsc --noEmit 2>&1 | head -20
echo "TSC_EXIT:$?"
```
Accept only: `TSC_EXIT:0` and 0 error lines.

### 2. Lint Gate
```bash
npm run lint 2>&1 | tail -20
echo "LINT_EXIT:$?"
```
Accept only: 0 errors, 0 warnings (Kalmeron uses `--max-warnings=0`).

### 3. i18n Completeness
When adding new translation keys:
```bash
# Verify key exists in both files
grep '"NewKey"' messages/ar.json messages/en.json
```
Both files must contain the key.

### 4. Route Uniqueness
When adding a new page:
```bash
find app -name "page.tsx" | grep "your-route"
```
Should return exactly 1 result.

### 5. Firestore Auth Coverage
When adding a new API route:
```bash
grep -n "getServerSession\|verifyIdToken\|verifySessionCookie" app/api/your-route/route.ts
```
Must return at least 1 match (or be a documented public endpoint).

### 6. File Existence Verification
After creating a file:
```bash
ls -la path/to/created/file.ext
```
Never assume a write succeeded — verify the file exists and has non-zero size.

## Verification by Task Type

### Feature additions:
1. `npx tsc --noEmit` → 0 errors
2. `npm run lint` → 0 warnings
3. Visual check: screenshot or log of the feature working

### Bug fixes:
1. Reproduce the bug in the original state (if possible)
2. Apply the fix
3. Confirm the original reproduction no longer triggers
4. `npx tsc --noEmit` → 0 errors

### i18n additions:
1. Both `ar.json` and `en.json` updated
2. `grep "NewNamespace.NewKey"` finds the key in both files
3. Component uses `t("NewNamespace.NewKey")` not hardcoded text

### API route additions:
1. Route file exists at `app/api/route-name/route.ts`
2. Auth check is present (or public endpoint is documented)
3. `npx tsc --noEmit` → 0 errors

### SAST/Security changes:
1. SAST workflow logic inverts correctly (grep -rL for missing auth = files WITHOUT auth)
2. No false positives in the allowlist
3. Gate thresholds are documented and justified

## Common Verification Failures in Kalmeron

| Failure | Symptom | Verify With |
|---|---|---|
| TypeScript error | Framer Motion types | `npx tsc --noEmit` |
| Missing translation | Component renders key string | `grep "key" messages/*.json` |
| ESLint setState | `setState in useEffect` warning | `npm run lint` |
| Route conflict | 404 or wrong page loads | `find app -name page.tsx \| grep route` |
| Missing auth | Security gate fails | `grep -rL "getServerSession" app/api/` |
| Wrong Firestore query | Missing userId filter | `grep -n "userId" app/api/route.ts` |

## Reporting Results

After running verification, always include the actual output:

```
✅ TypeScript: `npx tsc --noEmit` → exit 0, 0 errors
✅ Lint: `npm run lint` → 0 errors, 0 warnings  
✅ i18n: keys found in both ar.json and en.json
✅ Route: exactly 1 page.tsx at app/(dashboard)/new-feature/
```

Not:
```
❌ "Everything should work now"
❌ "TypeScript is probably fine"
❌ "The lint should pass"
```

---
name: kalmeron-i18n-workflow
description: Mandatory workflow for adding or editing UI text in Kalmeron. Covers the dual-file update rule, key naming convention, and correct useTranslations/getTranslations usage. Use whenever you add, change, or move any user-visible string.
---

# Kalmeron i18n Workflow

## When to Use
- Adding any new UI text, label, placeholder, error message, or button copy.
- Editing existing translated strings.
- Creating a new page or component that renders text.
- Debugging `next-intl` "Missing message" runtime errors.

---

## Core Rule: Atomic Dual-File Update

**Every i18n change must touch BOTH files in the same commit:**
- `messages/ar.json` — Arabic (primary language, RTL)
- `messages/en.json` — English (secondary language, LTR)

**Never** add a key to only one file. The `next-intl` library throws a runtime error when a key exists in one locale but not the other, and the UI will crash or show raw key paths.

---

## Key Naming Convention

Keys follow a three-level hierarchy: `Namespace.component.element`

```
Namespace     → top-level grouping (PascalCase — matches the page/feature, e.g. CashRunway, Wellbeing, ApiKeys)
component     → sub-grouping    (camelCase — matches a section or sub-component, e.g. form, header, emptyState)
element       → leaf key        (camelCase — descriptive of the string's role, e.g. title, submitBtn, errorMessage)
```

**Casing rule:** the top-level namespace is always **PascalCase**; the component and element levels are always **camelCase**. A three-part key therefore looks like `CashRunway.urgentActions.title`, never `cashRunway.urgentActions.title` or `CashRunway.UrgentActions.Title`.

### Examples from the codebase

```json
// Good — clear namespace.component.element hierarchy
"CashRunway.netBurnLabel"       → "صافي الحرق الشهري:"
"Dashboard.quickActionItems.cfo.label"   → "المدير المالي"
"Chat.emptyState.suggestions.pharmacy"  → "حلّل فكرة تطبيق…"
"Wellbeing.qLabels.energy"     → "مستوى طاقتك"

// Bad — flat, no namespace
"netBurnLabel"                  → ❌ no namespace — will collide
"dashboardCfoLabel"             → ❌ no component grouping
```

### Namespace naming rules
- One namespace per page/feature (e.g., `CashRunway`, `Wellbeing`, `ApiKeys`, `Webhooks`)
- Shared UI strings go in `Common` (buttons like save/cancel/close already exist there)
- Navigation strings go in `Nav`
- Reuse `Common.*` keys instead of duplicating generic strings

### Check before adding new keys
```bash
# Search for existing similar keys in both files to avoid duplication
grep -n "save\|cancel\|back" messages/ar.json | head -20
```

---

## File Structure

Both `messages/ar.json` and `messages/en.json` must have **identical key structure**. Values differ; keys must match exactly.

```json
// messages/ar.json
{
  "MyFeature": {
    "title": "عنوان الميزة",
    "description": "وصف الميزة",
    "actions": {
      "submit": "إرسال",
      "reset": "إعادة تعيين"
    }
  }
}

// messages/en.json  ← must have identical key paths
{
  "MyFeature": {
    "title": "Feature Title",
    "description": "Feature description",
    "actions": {
      "submit": "Submit",
      "reset": "Reset"
    }
  }
}
```

---

## Usage in Components

### Client Components (use `useTranslations`)

For any file with `"use client"` at the top:

```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("MyFeature");
  const tCommon = useTranslations("Common");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <button>{tCommon("save")}</button>
    </div>
  );
}
```

For nested namespaces you can either scope to the parent or drill into a child:
```tsx
// Option A — scope to parent, access children with dot notation
const t = useTranslations("Dashboard");
t("quickActionItems.cfo.label");

// Option B — scope directly to the sub-namespace
const tCfo = useTranslations("Dashboard.quickActionItems.cfo");
tCfo("label");
```

### Server Components / RSC (use `getTranslations`)

For files without `"use client"` (pure server components or `async` page functions):

```tsx
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("MyFeature");

  return (
    <div>
      <h1>{t("title")}</h1>
    </div>
  );
}
```

**Key difference**: `getTranslations` is async and must be awaited. `useTranslations` is synchronous and only works in client components.

### Parameterized strings (interpolation)

```json
// messages/ar.json
{ "CashRunway": { "result": "تبقّى لك {months} شهراً من السيولة" } }
```
```tsx
t("result", { months: 6 })  // → "تبقّى لك ٦ شهراً من السيولة"
```

### Arrays (for lists)

```json
{ "Wellbeing": { "ratings": ["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"] } }
```
```tsx
const ratings = tRaw.raw("ratings") as string[];  // use .raw() for arrays
```

---

## Adding a New Namespace — Checklist

When creating a new page with new strings:

**Step 1 — Choose the namespace name** (match the page name in PascalCase, e.g., `FinancialModel` for `/financial-model`).

**Step 2 — Add all keys to `messages/ar.json`** first (Arabic is the primary language).

**Step 3 — Add matching keys to `messages/en.json`** with English values. Structure must be identical.

**Step 4 — Import and call in the component:**
```tsx
const t = useTranslations("MyNamespace");  // client
// or
const t = await getTranslations("MyNamespace");  // server
```

**Step 5 — Run the pre-submission checklist below.**

---

## Pre-Submission Checklist

Before declaring i18n work done, verify all of the following:

- [ ] **Both files updated**: `messages/ar.json` AND `messages/en.json` were both edited in this change.
- [ ] **Key parity**: Every key added to `ar.json` exists in `en.json` with the same path, and vice versa.
- [ ] **No hardcoded Arabic**: Zero Arabic string literals inside JSX or TypeScript — every user-visible Arabic string comes from `t("...")`.
- [ ] **No hardcoded English**: Same for English UI strings.
- [ ] **Correct hook for context**: `useTranslations` in client components, `getTranslations` (awaited) in RSC / server functions.
- [ ] **No duplicated keys**: Check that the new keys don't already exist in `Common.*` or another namespace.
- [ ] **Interpolation variables match**: If the JSON has `{variable}`, the `t("key", { variable: value })` call passes the same name.
- [ ] **Arrays accessed with `.raw()`**: Any JSON array is retrieved via `tNamespace.raw("arrayKey") as string[]`, not `t("arrayKey")`.

---

## Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `MISSING_MESSAGE: Could not resolve "X.Y.Z"` | Key exists in `ar.json` but not `en.json` (or vice versa) | Add the missing key to the other file |
| `useTranslations` called in a Server Component | Hook used in RSC without `"use client"` | Switch to `getTranslations` and `await` it |
| `getTranslations` used in a Client Component | Async function called in client context | Switch to `useTranslations` |
| Raw Arabic text appearing instead of translation | Hardcoded string in JSX instead of `t("key")` | Replace with translation call |
| `t("arrayKey")` returns `[object Object]` | Array accessed without `.raw()` | Use `tNamespace.raw("arrayKey") as string[]` |
| Missing namespace — component renders key path | Namespace name in code differs from JSON (case-sensitive) | Ensure exact case match: `"CashRunway"` ≠ `"cashrunway"` |

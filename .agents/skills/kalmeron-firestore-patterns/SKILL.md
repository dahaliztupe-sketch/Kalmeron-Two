---
name: kalmeron-firestore-patterns
description: Mandatory Firestore query and write patterns for Kalmeron. Covers the required userId scoping, limit clause, collection naming, security rule alignment, and annotated examples for every major collection type. Use before writing any Firestore read or write operation.
---

# Kalmeron Firestore Patterns

## When to Use
- Before writing any Firestore query (`getDocs`, `getDoc`, `collection`, `where`, etc.).
- Before writing any Firestore mutation (`addDoc`, `setDoc`, `updateDoc`, `deleteDoc`).
- When debugging permission-denied errors or missing data.
- When reviewing API routes that touch Firestore.

---

## Correct Import Paths

```typescript
// Client SDK — use in "use client" components and client-side pages
import { db } from "@/src/lib/firebase";
import {
  collection, doc, query, where, orderBy, limit,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  serverTimestamp
} from "firebase/firestore";

// Admin SDK — use in app/api/ route handlers only (server-side)
import { adminDb } from "@/src/lib/firebase-admin";
import * as admin from "firebase-admin";
```

**Do not** use `@/src/lib/firebase/client` or `@/src/lib/firebase/admin` — those paths do not exist in this repo.

---

## The Mandatory Query Template

Every client-side Firestore **list query** must follow this pattern:

```typescript
import { db } from "@/src/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

const q = query(
  collection(db, "collection_name"),
  where("userId", "==", uid),   // ← REQUIRED: always scope to the authenticated user
  orderBy("createdAt", "desc"), // ← recommended: deterministic order
  limit(50)                     // ← REQUIRED: always cap results
);
const snap = await getDocs(q);
const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

**Two non-negotiable rules (for top-level user-owned collections):**
1. **`where("userId", "==", uid)`** — every list query on a top-level user-owned collection (`ideas`, `conversations`, `market_experiments`, etc.) must be scoped to the authenticated user's UID. Without this, the Firestore security rules will deny the read.
2. **`limit(N)`** — every list query must include a `limit()` call. Unbounded queries are a security risk and a performance hazard.

**Valid exceptions where `userId` filter is not required:**
- **Path-scoped docs** (`users/{uid}`, `user_credits/{uid}`, `runway_snapshots/{uid}`): the document ID is the UID, so the path itself scopes access — no `where("userId")` needed.
- **Subcollection queries** (`users/{uid}/memories`, `users/{uid}/threads`): the path already constrains results to one user.
- **`messages` collection**: scoped by `where("conversationId", "==", conversationId)` rather than `userId`. Ownership of the conversation must be validated server-side before the messages are returned to the client.
- **Public collections** (`opportunities`, `success_stories`): no user scoping needed — these are intentionally world-readable.

---

## Server-Side Queries (Admin SDK)

API routes use `adminDb` from `@/src/lib/firebase-admin`, which bypasses security rules entirely. The `userId` scope must still be applied for correctness:

```typescript
import { adminDb } from "@/src/lib/firebase-admin";

const snap = await adminDb
  .collection("collection_name")
  .where("userId", "==", userId)
  .orderBy("createdAt", "desc")
  .limit(100)
  .get();
```

The Admin SDK uses `.get()` (not `getDocs()`), `.collection()` directly on `adminDb`, and `admin.firestore.FieldValue.serverTimestamp()` instead of `serverTimestamp()`.

---

## Collection Naming Conventions

Use `snake_case` for all collection names.

| Collection | Scope | Client / Server | Notes |
|---|---|---|---|
| `users/{uid}` | owner (path-scoped) | both | Top-level user profile doc |
| `users/{uid}/threads/{threadId}` | owner (path-scoped) | both | Chat threads as subcollection |
| `users/{uid}/memories/{docId}` | owner (path-scoped) | both | User memory/brain nodes |
| `company_profiles` | userId field | server | Company data |
| `conversations` | userId field | both | Chat sessions |
| `ideas` | userId field | both | Idea documents |
| `market_experiments` | userId field | both | Market Lab experiments |
| `notifications` | userId field | server | User notifications |
| `rag_documents` | userId field | server | Knowledge base docs |
| `user_credits/{uid}` | owner (path-scoped) | read-only client | Billing credits (write: server only) |
| `runway_snapshots/{uid}` | owner (path-scoped) | both | Cash runway state |
| `opportunities` | public | read-only | No userId filter needed |
| `success_stories` | public | read-only | No userId filter needed |

### Server-only collections (allow read, write: if false)

Never write — or attempt to read — these from the client SDK. Use API routes with `adminDb`:

```
_ai_cache         analytics_events    cost_events        audit_log
api_keys          webhooks            fawry_orders        stripe_events
agent_actions     okrs                meetings            financial_reports
credit_transactions   payments        invoices            crm_leads
```

---

## Write Patterns

### Create (server-generated ID)
```typescript
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

await addDoc(collection(db, "ideas"), {
  userId: uid,              // ← always include userId on top-level collection docs
  title: "My idea",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
```

### Create (known ID, e.g., keyed by uid)
```typescript
import { db } from "@/src/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

await setDoc(doc(db, "runway_snapshots", uid), {
  userId: uid,
  cash: 500000,
  updatedAt: serverTimestamp(),
});
```

### Update (partial)
```typescript
import { db } from "@/src/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

await updateDoc(doc(db, "ideas", docId), {
  title: "Updated title",
  updatedAt: serverTimestamp(),
});
```

---

## Five Annotated Collection Examples

### 1. Users — `users/{uid}`

Profile doc where the document ID **is** the UID. No `where()` needed for single-doc reads — the path already scopes to the owner.

**Security rule:** `allow read, update: if isOwner(userId)`. Deletions: server-side only.

```typescript
import { db } from "@/src/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";

// READ — single user profile
const ref = doc(db, "users", uid);
const snap = await getDoc(ref);
if (!snap.exists()) throw new Error("user profile not found");
const profile = snap.data();

// WRITE — partial update
await updateDoc(ref, {
  name: "Ahmed",
  industry: "healthtech",
  updatedAt: serverTimestamp(),
});

// SUBCOLLECTION — user memories (path scopes access; limit still required)
const memoriesQ = query(
  collection(db, "users", uid, "memories"),
  orderBy("createdAt", "desc"),
  limit(50)
);
const memoriesSnap = await getDocs(memoriesQ);
```

---

### 2. Companies — `company_profiles`

One company document per user. All reads and writes go through server API routes; the client never accesses `company_profiles` directly.

**Security rule:** Server-side only — client reads through `GET /api/company/*`.

```typescript
// SERVER — API route (Admin SDK)
import { adminDb } from "@/src/lib/firebase-admin";
import * as admin from "firebase-admin";

// READ
const snap = await adminDb
  .collection("company_profiles")
  .where("userId", "==", userId)
  .limit(1)                             // one profile per user
  .get();
const company = snap.empty ? null : snap.docs[0].data();

// CREATE / UPDATE — always use merge to avoid overwriting unset fields
await adminDb.collection("company_profiles").doc(docId).set({
  userId,
  name: "My Startup",
  stage: "validation",
  industry: "fintech",
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
}, { merge: true });
```

---

### 3. Agents (AI Execution Records) — `agent_actions`

Records actions taken by AI agents during task execution. **Server-only** — written exclusively by the Admin SDK. Clients read agent history through API routes.

**Security rule:** `allow read, write: if false` — no client access whatsoever.

```typescript
// SERVER — agent orchestrator / API route (Admin SDK only)
import { adminDb } from "@/src/lib/firebase-admin";
import * as admin from "firebase-admin";

// WRITE — log an agent action
await adminDb.collection("agent_actions").add({
  userId,
  agentId: "cfo-agent",
  action: "financial_model",
  input: { revenue: 50000, burn: 30000 },
  output: { runway: 8.3, verdict: "healthy" },
  status: "completed",
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
});

// READ — expose history via API route (GET /api/agents/history)
const historySnap = await adminDb
  .collection("agent_actions")
  .where("userId", "==", userId)
  .orderBy("createdAt", "desc")
  .limit(50)
  .get();
```

**Never** import `agent_actions` in a client component or call `getDocs` on it from the browser.

---

### 4. Sessions (Chat Conversations) — `conversations` + `messages`

`conversations` holds the session metadata; `messages` holds the individual chat turns.

**Security rule:** Owner-only reads/writes. Composite indexes: `userId ASC + updatedAt DESC` and `userId ASC + pinned DESC + updatedAt DESC` (defined in `firestore.indexes.json`).

```typescript
import { db } from "@/src/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

// LIST conversations — newest first
const conversationsQ = query(
  collection(db, "conversations"),
  where("userId", "==", uid),
  orderBy("updatedAt", "desc"),
  limit(20)
);
const convSnap = await getDocs(conversationsQ);

// CREATE a new conversation
await addDoc(collection(db, "conversations"), {
  userId: uid,
  title: "New conversation",
  agentId: "cfo-agent",
  pinned: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

// LIST messages — scoped by conversationId, not userId
// Validate conversation ownership in the API route before returning messages.
const messagesQ = query(
  collection(db, "messages"),
  where("conversationId", "==", conversationId),
  orderBy("createdAt", "asc"),
  limit(200)
);
```

---

### 5. Billing — `user_credits/{uid}`

Document ID is the UID. Clients may **read** their own credits balance; all writes go through API routes.

**Security rule:** `allow read: if isOwner(userId)`. `allow write: if false` — Admin SDK only.

```typescript
import { db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// READ — client SDK
const ref = doc(db, "user_credits", uid);
const snap = await getDoc(ref);
const credits = snap.data() as {
  dailyBalance: number;   // remaining credits today
  dailyLimit: number;     // total daily allocation
  plan: "free" | "starter" | "pro" | "founder";
};

// Compute usage percentage (used in UpgradeBanner)
const usedPct = ((credits.dailyLimit - credits.dailyBalance) / credits.dailyLimit) * 100;

// WRITE — ❌ forbidden from client
// All debit operations go through API routes:
// POST /api/billing/deduct → uses adminDb
```

**Server-side debit (Admin SDK in an API route):**
```typescript
import { adminDb } from "@/src/lib/firebase-admin";
import * as admin from "firebase-admin";

await adminDb.collection("user_credits").doc(userId).update({
  dailyBalance: admin.firestore.FieldValue.increment(-tokensUsed),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});
```

Never trust the client to report token consumption — always compute and debit server-side.

---

## The `npm run test:rules` Gate

Before any PR that changes `firestore.rules`, run:

```bash
npm run test:rules
```

This spins up the Firebase emulator and runs the rules test suite. All tests must pass. If you add a new collection that clients need to read/write:
1. Add an explicit `match /new_collection/{docId}` rule in `firestore.rules`.
2. Add allow and deny test cases in the rules test file.
3. Add any required composite index to `firestore.indexes.json`.

---

## Forbidden Patterns Table

| Pattern | Why Forbidden | Correct Alternative |
|---|---|---|
| `import { db } from "@/src/lib/firebase/client"` | Path does not exist in this repo | `import { db } from "@/src/lib/firebase"` |
| `import { adminDb } from "@/src/lib/firebase/admin"` | Path does not exist in this repo | `import { adminDb } from "@/src/lib/firebase-admin"` |
| `getDocs(collection(db, "ideas"))` (no `where`) | Returns ALL docs — fails security rules | Add `where("userId", "==", uid).limit(50)` |
| List query without `limit()` | Unbounded — can return thousands of docs | Always add `.limit(N)` |
| Client-side write to `agent_actions`, `api_keys`, `webhooks`, `fawry_orders` | `allow write: if false` in rules | Use a server API route with `adminDb` |
| `where("email", "==", email)` from the client | Exposes other users' data if rules relax | Always filter by `userId`, not email |
| `setDoc` without `{ merge: true }` on existing doc | Overwrites entire document, deleting unset fields | Use `updateDoc` or `setDoc(ref, data, { merge: true })` |
| Query requiring a composite index not in `firestore.indexes.json` | "Requires an index" error in production | Add the index definition before deploying |
| Trusting client-reported token usage for billing debits | Client can lie about consumption | Compute and debit server-side in an API route |

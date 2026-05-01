# Kalmeron Firestore Schema

**المشروع:** kalmeron-two  
**آخر تحديث:** 2026-05-01  
**الحالة:** مرجع رسمي لجميع Collections

---

## Collections الأساسية

### `users`
بيانات المستخدم الأساسية.

```
users/{userId}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string?
├── plan: "free" | "starter" | "pro" | "founder"
├── credits: number
├── isOnboarded: boolean
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### `workspaces`
مساحات العمل — كل مؤسس له workspace واحد أو أكثر.

```
workspaces/{workspaceId}
├── ownerId: string
├── name: string
├── industry: string?
├── stage: "idea" | "mvp" | "growth" | "scale"
├── country: "EG" | "SA" | "AE" | ...
├── goals: string[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### `workspace_members`
أعضاء workspace (للـ multi-tenant مستقبلاً).

```
workspace_members/{memberId}
├── workspaceId: string
├── userId: string
├── role: "admin" | "editor" | "viewer"
├── invitedAt: Timestamp
└── joinedAt: Timestamp?
```

---

## المحادثات والذاكرة

### `chat_history`
تاريخ محادثات المستخدمين مع الوكلاء.

```
chat_history/{sessionId}
├── userId: string
├── workspaceId: string?
├── title: string
├── messages: Array<{
│   id: string,
│   role: "user" | "assistant" | "system",
│   content: string,
│   agentId: string?,
│   thoughtChain: string[]?,
│   citations: RagCitation[]?,
│   createdAt: Timestamp
│ }>
├── agentId: string?
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Indexes المطلوبة:**
- `userId` ASC + `updatedAt` DESC (للـ history list)

### `user_memory`
ذاكرة طويلة الأمد لكل مستخدم.

```
user_memory/{memoryId}
├── userId: string
├── content: string
├── category: string
├── importance: number (0-1)
├── createdAt: Timestamp
└── expiresAt: Timestamp?
```

---

## قاعدة المعرفة (RAG)

### `rag_chunks`
Chunks المستندات المرفوعة مع embeddings.

```
rag_chunks/{chunkId}
├── userId: string
├── documentId: string
├── documentName: string
├── source: "pdf" | "csv" | "xlsx" | "text"
├── chunkIndex: number
├── text: string
├── embedding: number[] (768-dim)
└── createdAt: Timestamp
```

**Indexes المطلوبة:**
- `userId` ASC + `documentId` ASC (للـ listDocuments وdeleteDocument)
- `userId` ASC (للـ search)

**ملاحظة أداء:** البحث حالياً In-memory cosine similarity. للمستخدمين بأكثر من 500 chunk ينصح بـ vector database.

### `knowledge_base`
قاعدة المعرفة العامة للمنصة.

```
knowledge_base/{entryId}
├── title: string
├── content: string
├── tags: string[]
├── language: "ar" | "en"
└── createdAt: Timestamp
```

---

## نظام الفواتير والدفع

### `user_credits`
رصيد Credits لكل مستخدم.

```
user_credits/{userId}
├── balance: number
├── totalEarned: number
├── totalConsumed: number
└── updatedAt: Timestamp
```

### `credit_transactions`
سجل كل عمليات الـ Credits.

```
credit_transactions/{txId}
├── userId: string
├── amount: number (+ للإضافة، - للخصم)
├── type: "purchase" | "consumption" | "refund" | "bonus"
├── description: string
├── agentId: string?
├── sessionId: string?
└── createdAt: Timestamp
```

### `payments`
سجل المدفوعات (Stripe + Fawry).

```
payments/{paymentId}
├── userId: string
├── provider: "stripe" | "fawry"
├── amount: number
├── currency: "EGP" | "USD"
├── status: "pending" | "completed" | "failed" | "refunded"
├── externalId: string (Stripe/Fawry reference)
├── plan: string?
└── createdAt: Timestamp
```

### `stripe_events`
Stripe webhook events (idempotency).

```
stripe_events/{eventId}
├── processed: boolean
└── createdAt: Timestamp
```

### `fawry_orders`
طلبات Fawry.

```
fawry_orders/{orderId}
├── userId: string
├── merchantRefNumber: string
├── amount: number
├── status: string
└── createdAt: Timestamp
```

### `invoices`
فواتير الاشتراك.

```
invoices/{invoiceId}
├── userId: string
├── amount: number
├── currency: string
├── period: { start: Timestamp, end: Timestamp }
├── pdfUrl: string?
└── createdAt: Timestamp
```

---

## الإجراءات والـ Inbox

### `action_requests`
طلبات إجراءات الوكلاء التي تحتاج موافقة المستخدم.

```
action_requests/{requestId}
├── userId: string
├── actionId: string
├── label: string
├── input: Record<string, unknown>
├── rationale: string
├── requestedBy: string
├── status: "pending" | "approved" | "rejected"
├── result: unknown?
├── error: string?
├── createdAt: Timestamp
└── decidedAt: Timestamp?
```

---

## سير العمل (Workflows)

### `launch_runs`
تشغيلات سير العمل (Launchpad).

```
launch_runs/{runId}
├── userId: string
├── workspaceId: string?
├── workflowId: string
├── status: "running" | "completed" | "failed"
├── steps: Array<{ name, status, output?, error? }>
├── startedAt: Timestamp
└── completedAt: Timestamp?
```

### `recipe_runs`
تشغيلات الـ Recipes (Templates).

```
recipe_runs/{runId}
├── userId: string
├── recipeId: string
├── status: string
├── output: unknown?
└── createdAt: Timestamp
```

---

## إدارة الشركة

### `twins`
النسخ الرقمية للشركات (Company Builder).

```
twins/{twinId}
├── userId: string
├── workspaceId: string?
├── name: string
├── industry: string
├── orgChart: object
├── departments: Array<{...}>
└── updatedAt: Timestamp
```

### `okrs`
أهداف ومؤشرات OKR.

```
okrs/{okrId}
├── userId: string
├── objective: string
├── keyResults: Array<{ text, progress, target }>
├── quarter: string
├── status: "active" | "completed" | "cancelled"
└── createdAt: Timestamp
```

---

## الأمان والامتثال

### `audit_log`
سجل كل الإجراءات الحساسة.

```
audit_log/{logId}
├── userId: string
├── action: string
├── target: string?
├── details: Record<string, unknown>
├── ip: string?
└── createdAt: Timestamp
```

**ملاحظة:** يجب إضافة TTL policy لهذه Collection (90 يوم).

### `compliance_log`
سجل الامتثال PDPL.

```
compliance_log/{logId}
├── userId: string
├── event: string
├── data: Record<string, unknown>
└── createdAt: Timestamp
```

### `account_deletions`
طلبات حذف الحساب (GDPR/PDPL).

```
account_deletions/{deletionId}
├── userId: string
├── requestedAt: Timestamp
├── completedAt: Timestamp?
└── status: "pending" | "completed"
```

---

## الاستخدام والتحليلات

### `usage_daily`
استخدام API اليومي.

```
usage_daily/{docId}  // format: {userId}_{YYYY-MM-DD}
├── userId: string
├── date: string
├── messages: number
├── tokens: number
├── cost: number (USD)
└── byAgent: Record<string, number>
```

### `usage_monthly`
استخدام API الشهري.

```
usage_monthly/{docId}  // format: {userId}_{YYYY-MM}
├── userId: string
├── month: string
├── messages: number
├── tokens: number
├── cost: number (USD)
└── updatedAt: Timestamp
```

### `analytics_events`
أحداث تحليلية.

```
analytics_events/{eventId}
├── userId: string?
├── event: string
├── properties: Record<string, unknown>
└── createdAt: Timestamp
```

---

## الإشعارات والتواصل

### `omnichannel_messages`
رسائل متعددة القنوات (WhatsApp، Telegram، Email).

```
omnichannel_messages/{msgId}
├── userId: string
├── channel: "whatsapp" | "telegram" | "email"
├── direction: "inbound" | "outbound"
├── content: string
├── status: string
└── createdAt: Timestamp
```

### `daily_brief_deliveries`
سجل إرسال الـ Daily Brief.

```
daily_brief_deliveries/{deliveryId}
├── userId: string
├── deliveredAt: Timestamp
├── channel: "email" | "in-app"
└── summary: string
```

---

## CRM والمبيعات

### `crm_leads`
قاعدة بيانات العملاء المحتملين.

```
crm_leads/{leadId}
├── userId: string
├── name: string
├── email: string?
├── phone: string?
├── source: string
├── stage: "lead" | "prospect" | "customer" | "churned"
├── notes: string?
└── createdAt: Timestamp
```

---

## Firestore Indexes المطلوبة

```json
{
  "indexes": [
    {
      "collectionGroup": "chat_history",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "rag_chunks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "documentId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "credit_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "action_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "launch_runs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "startedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "usage_daily",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "opportunities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "deadline", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Security Rules الأساسية

كل Collection يجب أن تتحقق من:
1. `request.auth != null` — المستخدم مسجل دخول
2. `request.auth.uid == resource.data.userId` — يقرأ/يكتب بياناته هو فقط

لا يجب أن يكون في أي مكان `allow read, write: if true;`

---

## Collections التي تحتاج TTL Policy

| Collection | مدة الاحتفاظ |
|-----------|-------------|
| `audit_log` | 90 يوم |
| `analytics_events` | 30 يوم |
| `cron_runs` | 30 يوم |
| `prompt_cache` | 24 ساعة |
| `semantic_prompt_cache` | 7 أيام |
| `rag_quarantine_events` | 90 يوم |

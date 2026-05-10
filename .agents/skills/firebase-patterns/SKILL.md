---
name: firebase-patterns
description: Firebase best practices for Firestore, Firebase Auth, and Firebase Storage in Next.js apps. Use when building or reviewing Firestore queries, authentication flows, storage uploads, or Firebase security rules. Covers Kalmeron-specific patterns and common pitfalls.
---

# Firebase Patterns for Next.js (Kalmeron-specific)

Official patterns from Firebase engineering, adapted for Kalmeron's architecture.

## Firestore Query Patterns

### Mandatory Rules (Kalmeron)
```typescript
// ✅ ALWAYS: scope to userId
const docs = await db
  .collection('notifications')
  .where('userId', '==', session.user.id)  // mandatory scoping
  .orderBy('createdAt', 'desc')
  .limit(50)                                 // mandatory limit
  .get();

// ✅ Real-time listener with cleanup
const unsubscribe = db
  .collection('chat')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .onSnapshot((snapshot) => {
    setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
return () => unsubscribe(); // critical: cleanup on unmount
```

### Server-Side Patterns (API Routes)
```typescript
// app/api/*/route.ts — use Admin SDK
import { getFirestore } from 'firebase-admin/firestore';
const db = getFirestore();

// Batch writes (atomic)
const batch = db.batch();
batch.set(db.collection('events').doc(), eventData);
batch.update(db.collection('users').doc(userId), { lastActive: Date.now() });
await batch.commit(); // all-or-nothing
```

### Subcollection Pattern
```typescript
// Prefer subcollections for user-owned data
const messagesRef = db
  .collection('users').doc(userId)
  .collection('messages'); // scoped by structure, not just query

// Collectiongroup query (for admin)
const allMessages = await db
  .collectionGroup('messages')
  .where('flagged', '==', true)
  .limit(100)
  .get();
```

## Firebase Auth Patterns

### Session Management
```typescript
// Server-side session verification
import { getAuth } from 'firebase-admin/auth';

export async function getServerSession(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  try {
    const decoded = await getAuth().verifySessionCookie(token, true);
    return decoded;
  } catch {
    return null;
  }
}

// Create session cookie (on login)
const sessionCookie = await getAuth().createSessionCookie(idToken, {
  expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days in ms
});
```

### Client-Side Auth State
```typescript
// Use onAuthStateChanged with cleanup
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    setUser(user);
    setLoading(false);
  });
  return unsubscribe; // cleanup
}, []);
```

## Firebase Storage Patterns

### Secure Upload
```typescript
// Client-side upload with path scoping
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadAvatar = async (file: File, userId: string) => {
  // Validate file first
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Invalid file type');
  }
  // UUID filename — no user-supplied names
  const ext = file.type.split('/')[1];
  const storageRef = ref(storage, `avatars/${userId}/${crypto.randomUUID()}.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
```

## Firestore Security Rules (Reference)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Common Pitfalls (Kalmeron-specific)

| Pitfall | Fix |
|---|---|
| Missing `.limit()` → unbounded reads | Always add `.limit(50)` or pagination |
| `userId` from request body → IDOR | Always use `session.user.id` from verified session |
| onSnapshot without cleanup → memory leak | Return unsubscribe in useEffect |
| Client SDK in API routes → wrong SDK | Use `firebase-admin` in `app/api/` |
| Missing index for compound queries | Add composite indexes in `firestore.indexes.json` |

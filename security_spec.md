# Security Specification: Kalmeron Two

## 1. Data Invariants
-   **User Profile Sovereignty**: A user doc and its sub-collections (ideas, threads, memories) must only be accessible by the authenticated owner.
-   **RAG Integrity**: The `knowledge_base` collection matches only system-side reads; client-side write access is strictly forbidden.
-   **ID Validation**: All document IDs must be validated to prevent ID poisoning (regex + size).
-   **Immutable Audits**: `createdAt` timestamps must be server-validated and immutable.
-   **Identity Integrity**: `userId` fields in all payloads must match the `request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Attacker Strategy)

1.  **Identity Spoofing**: Attempt to create an idea under another user's `userId`.
2.  **Shadow Update**: Attempt to update a user profile with an `isAdmin: true` field.
3.  **Cross-User Harvesting**: Attempting to `list` ideas from `/users/victim_uid/ideas`.
4.  **RAG Poisoning**: Attempting to write a malicious entry into `knowledge_base`.
5.  **ID Injection**: Attempting to create a document with a 1MB string as the document ID.
6.  **Timestamp Fraud**: Sending a client-side `createdAt` date from 2020.
7.  **State Shortcut**: Updating a project's `status` directly to 'completed' without fulfilling prerequisites.
8.  **Bulk Deletion**: Attempting to delete the entire `knowledge_base`.
9.  **PII Extraction**: Authenticated user trying to `get` the email of a different user.
10. **Resource Exhaustion**: Sending 100 long tags in an idea payload.
11. **Shadow Threading**: Creating a message in a thread that doesn't belong to the user.
12. **Revocation Bypass**: Continuing to update an idea after the user account has been disabled (requires auth check).

## 3. Test Runner Strategy
We will implement detailed Firestore Security Rules tests in `firestore.rules.test.ts` to ensure all above payloads are `PERMISSION_DENIED`.

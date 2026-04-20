# Security Specification: Task Management System

## 1. Data Invariants
- A `Task` cannot exist without a valid `createdBy` and `assignee` UID.
- `taskId` is immutable once document is created.
- `status` transitions must follow a valid flow (e.g., pending -> in_progress -> completed).
- `parentTaskId` references must point to an existing task in the same collection.

## 2. The "Dirty Dozen" Payloads (Examples to guard against)
1. Creating a task with empty `taskId`.
2. Updating `status` from `completed` to `in_progress`.
3. Hijacking `createdBy` during `TaskUpdate`.
4. Injecting a 1MB string into `description`.
5. Setting `assignee` to an invalid UID.
6. Deleting a task without being the owner.
7. Accessing tasks of another user.
8. Creating a task with a `parentTaskId` that does not exist.
9. Modifying `createdAt` during an update.
10. Spoofing `workflowId`.
11. Setting priority to an unsupported value.
12. Attempting mass updates to status via bulk operations.

## 3. The Test Runner (Plan)
- `firestore.rules.test.ts` will verify that all 12 payloads return PERMISSION_DENIED.

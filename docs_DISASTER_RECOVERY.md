# Disaster Recovery Plan
1. Daily backup of Firestore to GCS: Use Cloud Functions + Firestore export.
2. Restore: Use Cloud Functions + Firestore import from GCS.

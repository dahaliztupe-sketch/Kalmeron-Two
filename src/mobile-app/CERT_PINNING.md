# Mobile Certificate Pinning — Operations Runbook

**Closes:** `docs/THREAT_MODEL.md` TB7 (🔴 → 🟢)
**Owner:** Mobile Engineering · **Reviewed:** 2026-04-24

---

## Why pinning?
The Expo mobile app accepts user credentials, financial data, and AI conversations. A compromised CA, a malicious Wi-Fi hotspot, or a corporate proxy installing its own root cert can perform MITM attacks. **TLS pinning** binds the app to the *public key* of `api.kalmeron.com` so it refuses to talk to anyone else.

We pin the **SubjectPublicKeyInfo (SPKI) hash**, not the certificate itself. This survives certificate renewal as long as the public key is preserved.

---

## Pinning architecture

```
┌─── Mobile App (release build) ──────────┐
│  hardcoded EXPO_PUBLIC_PINNED_SPKI_HASHES│
│   = "primary_b64,backup_b64"             │
│                                          │
│  src/lib/api-client.ts → pinnedFetch()  │
│  uses react-native-ssl-pinning           │
└──────────────┬───────────────────────────┘
               │ HTTPS  (validates pin during handshake)
               ▼
       api.kalmeron.com (Vercel / Cloudflare)
       leaf cert SPKI must match one of the pins
```

We **always ship ≥ 2 pins** (primary + backup) so we can rotate without bricking installed apps. The app refuses to build a release without ≥ 2 pins (enforced in `api-client.ts`).

---

## Generating SPKI hashes

```bash
# For the production endpoint
openssl s_client -connect api.kalmeron.com:443 -showcerts </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | base64

# Example output: aB12cD34eF56gH78iJ90kL12mN34oP56qR78sT90uV12=
```

Run this against:
1. The current production leaf cert → **primary pin**.
2. A pre-issued backup cert (or the staging cert, if structurally similar) → **backup pin**.

Both go into `EXPO_PUBLIC_PINNED_SPKI_HASHES` (comma-separated) at build time.

---

## EAS Build configuration

Add to `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://api.kalmeron.com",
        "EXPO_PUBLIC_PINNED_SPKI_HASHES": "PRIMARY_B64,BACKUP_B64"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://staging.kalmeron.com",
        "EXPO_PUBLIC_PINNED_SPKI_HASHES": "STAGING_B64,STAGING_BACKUP_B64"
      }
    }
  }
}
```

> **Never** commit pin values — store them as EAS secrets via `eas secret:create`.

---

## Rotation procedure (zero-downtime)

When the production key is rotated (planned every 12 months OR emergency on suspected compromise):

1. **T-30 days:** Generate the next-rotation key pair on the server. Don't deploy yet.
2. **T-30 days:** Compute its SPKI hash (call it `NEXT_PRIMARY_B64`).
3. **T-30 days:** Ship a mobile app release that pins `[CURRENT_PRIMARY_B64, NEXT_PRIMARY_B64]`. Submit to App Store + Play Store. Wait for ≥ 90% adoption (typically 14-21 days).
4. **T-0:** Activate the new server cert (issued from `NEXT_PRIMARY_B64`).
5. **T+1 day:** Verify Sentry shows zero `SSLPinningError` events.
6. **T+7 days:** Generate the *next* backup. Ship a release that pins `[NEXT_PRIMARY_B64, NEW_BACKUP_B64]`. The old `CURRENT_PRIMARY_B64` is now retired.

**Emergency rotation (suspected key compromise):**
- Skip the staged adoption window. Force-update via App Store + Play Store remote-config flag.
- Accept that users on old app versions will be locked out until they update.
- Show a server-side message via the version-check endpoint instructing manual update.

---

## Failure modes & monitoring

| Symptom | Likely cause | Action |
|---|---|---|
| Spike in `SSLPinningError` (Sentry) right after release | App ships wrong pin | Hotfix release with correct pins; instruct users to update |
| Single user reports "can't connect" | Their device intercepted by corporate proxy | Expected — not actionable. Document in support FAQ |
| All requests fail after cert renewal | Forgot to deploy app with new pin first | Roll back server cert; ship app first; retry |
| `Trust evaluation failed` (iOS) | OS trust store changed | Verify App Transport Security settings; check iOS version compat |

---

## Bypassing pinning (debug only)

In development (`__DEV__ === true`) the client falls back to standard `fetch` if `EXPO_PUBLIC_PINNED_SPKI_HASHES` is empty. This allows:
- Hitting localhost (`http://10.0.2.2:5000` for Android emulator).
- Testing against ngrok / temporary self-signed staging.

**Never** ship a release with `__DEV__ = true` — Expo's release config disables this automatically.

---

## Verification checklist before each release

- [ ] `EXPO_PUBLIC_PINNED_SPKI_HASHES` contains ≥ 2 valid base64 SHA-256 hashes (44 chars each).
- [ ] Both pins verified against `api.kalmeron.com` and the staged backup cert.
- [ ] Sentry alert configured for `SSLPinningError` rate > 1% of requests.
- [ ] `react-native-ssl-pinning` version pinned in `package.json` (no `^` for this critical dep).
- [ ] Release notes mention any pin rotation for support team awareness.

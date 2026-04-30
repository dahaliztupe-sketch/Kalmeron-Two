/**
 * MFA / 2FA helpers — متعدد العوامل بنمط Stripe و GitHub.
 *
 * يستخدم Firebase Auth's multiFactor (TOTP) كآلية أساسية، مع إمكانية
 * التوسع لاحقاً لدعم WebAuthn / Security Keys. الدوال هنا تُستدعى
 * من صفحة الإعدادات `/settings/security/mfa` ومن middleware التحقق.
 */

import {
  multiFactor,
  TotpMultiFactorGenerator,
  type MultiFactorUser,
  type TotpSecret,
  type User,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";

export type MfaFactorType = "totp" | "phone";

export interface MfaEnrollmentChallenge {
  secret: TotpSecret;
  qrCodeUrl: string;
  manualEntryKey: string;
}

/**
 * بدء تسجيل عامل TOTP جديد (مثل Google Authenticator / Authy).
 * يُرجع secret + QR code الذي يعرضه على المستخدم.
 */
export async function beginTotpEnrollment(user: User, accountName: string): Promise<MfaEnrollmentChallenge> {
  const mfaUser: MultiFactorUser = multiFactor(user);
  const session = await mfaUser.getSession();
  const secret = await TotpMultiFactorGenerator.generateSecret(session);

  const qrCodeUrl = secret.generateQrCodeUrl(accountName, "Kalmeron AI");
  return {
    secret,
    qrCodeUrl,
    manualEntryKey: secret.secretKey,
  };
}

/**
 * إكمال تسجيل TOTP بعد إدخال المستخدم لأول OTP من تطبيق المصادقة.
 * displayName يظهر في قائمة عوامل المصادقة الخاصة بالمستخدم.
 */
export async function finishTotpEnrollment(
  user: User,
  secret: TotpSecret,
  otp: string,
  displayName = "تطبيق المصادقة",
): Promise<void> {
  if (!/^\d{6}$/.test(otp)) {
    throw new Error("OTP_INVALID_FORMAT");
  }
  const mfaUser = multiFactor(user);
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, otp);
  await mfaUser.enroll(assertion, displayName);
}

/**
 * فحص ما إذا كان المستخدم قد فعّل MFA على حسابه.
 */
export function isMfaEnabled(user: User): boolean {
  const mfaUser = multiFactor(user);
  return mfaUser.enrolledFactors.length > 0;
}

/**
 * سرد جميع عوامل المصادقة المسجلة للمستخدم (لعرضها في إعدادات الأمان).
 */
export function listEnrolledFactors(user: User) {
  const mfaUser = multiFactor(user);
  return mfaUser.enrolledFactors.map((f) => ({
    uid: f.uid,
    displayName: f.displayName,
    factorId: f.factorId,
    enrollmentTime: f.enrollmentTime,
  }));
}

/**
 * إلغاء تسجيل عامل MFA. يتطلب إعادة مصادقة المستخدم مؤخراً.
 */
export async function unenrollFactor(user: User, factorUid: string): Promise<void> {
  const mfaUser = multiFactor(user);
  const factor = mfaUser.enrolledFactors.find((f) => f.uid === factorUid);
  if (!factor) throw new Error("FACTOR_NOT_FOUND");
  await mfaUser.unenroll(factor);
}

/**
 * توليد رموز احتياطية (backup codes) — لاستخدامها عند فقد جهاز TOTP.
 * 10 رموز، كل واحد 8 أحرف عشوائية.
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < count; i++) {
    let code = "";
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    for (const b of bytes) code += alphabet[b % alphabet.length];
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

export const MFA = {
  beginTotpEnrollment,
  finishTotpEnrollment,
  isMfaEnabled,
  listEnrolledFactors,
  unenrollFactor,
  generateBackupCodes,
};

export default MFA;

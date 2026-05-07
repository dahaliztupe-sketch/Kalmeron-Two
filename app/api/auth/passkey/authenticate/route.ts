import { NextResponse } from 'next/server';

// @simplewebauthn/server محجوز للتنفيذ المستقبلي - يتطلب إعداد قاعدة بيانات كاملة
// حالياً يُستخدم Google Sign-In عبر Firebase Auth

const COMING_SOON_BODY = {
  status: 'coming_soon',
  alternativeMethod: 'google_sign_in',
  message: 'Passkey authentication is not yet available. Please use Google Sign-In.',
} as const;

export async function GET() {
  return NextResponse.json(COMING_SOON_BODY, { status: 410 });
}

export async function POST() {
  return NextResponse.json(COMING_SOON_BODY, { status: 410 });
}

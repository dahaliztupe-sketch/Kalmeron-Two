import { NextResponse } from 'next/server';

// @simplewebauthn/server محجوز للتنفيذ المستقبلي - يتطلب إعداد قاعدة بيانات كاملة
// حالياً يُستخدم Google Sign-In عبر Firebase Auth

export async function GET() {
  return NextResponse.json(
    { error: 'Passkey authentication not yet available. Please use Google Sign-In.' },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Passkey authentication not yet available. Please use Google Sign-In.' },
    { status: 501 }
  );
}

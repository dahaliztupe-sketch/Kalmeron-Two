import { NextResponse } from 'next/server';

// @simplewebauthn/server محجوز للتنفيذ المستقبلي - يتطلب إعداد قاعدة بيانات كاملة
// حالياً يُستخدم Google Sign-In عبر Firebase Auth

const rpName = 'Kalmeron Two';
const rpID = 'kalmeron.com';
const origin = `https://${rpID}`;

export async function GET() {
  return NextResponse.json(
    { error: 'Passkey registration not yet available. Please use Google Sign-In.', rpName, rpID, origin },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Passkey registration not yet available. Please use Google Sign-In.' },
    { status: 501 }
  );
}

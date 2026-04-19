import { NextResponse } from 'next/server';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

// In a real database, this would be retrieved/stored securely
const rpName = 'Kalmeron Two';
const rpID = 'kalmeron.com';
const origin = `https://${rpID}`;

export async function GET(req: Request) {
  // 1. Generate Registration Options (Passkey Challenge)
  const user = { id: 'user_123', username: 'entrepreneur@egypt.com' }; // Mock user ID/email
  
  try {
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.username,
      attestationType: 'none',
      authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    });

    return NextResponse.json(options);
  } catch(error) {
    return NextResponse.json({ error: 'Failed to generate WebAuthn options' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // 2. Verify Registration Response from Authenticator (Client Device)
  const body = await req.json();
  
  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: 'expected_challenge_from_db_session',
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified) {
        // [Firebase Logic Placeholder]: Store verification.registrationInfo in Firestore
        // under the user's document for future authenticate challenges.
        return NextResponse.json({ 
            success: true, 
            verified: true, 
            info: 'Passkey registered successfully! Can now generate custom Firebase token on login.' 
        });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

const rpID = 'kalmeron.com';
const origin = `https://${rpID}`;

export async function GET(req: Request) {
  // 1. Generate Authentication Options (Login Challenge)
  // In a real scenario, you'd get the user identifier from request parameters 
  // and fetch their registered authenticators from the database.
  
  try {
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      // allowCredentials: userAuthenticators.map(auth => ({
      //   id: auth.credentialID,
      //   type: 'public-key',
      //   transports: auth.transports,
      // })),
    });

    // Store `options.challenge` in session/DB to verify later
    return NextResponse.json(options);
  } catch(error) {
    return NextResponse.json({ error: 'Failed to generate WebAuthn authentication options' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // 2. Verify Authentication Response (Login Attempt)
  const body = await req.json();
  
  try {
    // In a real scenario, fetch the registered authenticator from DB matching body.id
    // const authenticator = getAuthenticatorById(body.id);
    
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: 'expected_challenge_from_db_session',
      expectedOrigin: origin,
      expectedRPID: rpID,
      // authenticator,
    });

    if (verification.verified) {
        // [Firebase Logic Placeholder]: 
        // 1. createCustomToken(user.uid) using Firebase Admin SDK
        // 2. Return auth token to the client so they can signInWithCustomToken()
        return NextResponse.json({ 
            success: true, 
            verified: true, 
            token: "firebase_custom_token_placeholder",
            message: 'User authenticated successfully via Passkey!' 
        });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

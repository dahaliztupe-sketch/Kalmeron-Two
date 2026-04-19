import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET() {
  try {
    // Check Firestore connection
    const healthDoc = await getDoc(doc(db, 'system', 'health'));
    
    // Check Gemini API (optional: could add a simple call here if needed)
    
    return NextResponse.json({ 
      status: 'ok', 
      firestore: 'connected',
      timestamp: new Date().toISOString() 
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'System unhealthy' 
    }, { status: 500 });
  }
}

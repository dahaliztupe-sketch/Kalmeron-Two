import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { runCoordinator } from '@/src/ai/supervisor/coordinator';

export async function POST(req: Request) {
  const { goal } = await req.json();

  if (!goal) {
    return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
  }

  try {
    // Run the team via coordinator
    const result = await runCoordinator(goal);
    
    // In a real implementation, you would stream the structured output.
    // For this demonstration, we return the result directly.
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Supervisor Engine Error:', error);
    return NextResponse.json({ error: 'Failed to process coordinator task' }, { status: 500 });
  }
}

import { Mem0 } from 'mem0ai';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { generateText } from 'ai';
import { MODELS } from './gemini';

// Initialize Mem0 for Advanced Long-Term Memory (Agentic Architecture)
export const mem0 = new Mem0({
  config: {
    vectorStore: {
      provider: 'pinecone',
    },
    llm: {
      provider: 'google',
      model: 'gemini-2.5-flash-lite',
    },
  },
});

// دورة الذاكرة لكل تفاعل (Multi-Agent Memory Cycle)
export async function processWithMemory(
  userId: string,
  targetQuery: string,
  handler: (context: unknown) => Promise<unknown>
): Promise<unknown> {
  const relevantMemories = await mem0.search(targetQuery, { user_id: userId, limit: 5 });
  const result = await handler({ context: relevantMemories });
  await mem0.add(
    [
      { role: 'user', content: targetQuery },
      { role: 'assistant', content: result },
    ],
    { user_id: userId }
  );
  return result;
}

/**
 * Retrieves the cohesive context of the user by combining their profile and recent memories.
 */
export async function getUserMemory(userId: string): Promise<string> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};

  const memoryRef = collection(db, 'users', userId, 'memories');
  const q = query(memoryRef, orderBy('createdAt', 'desc'), limit(5));
  const memorySnap = await getDocs(q);

  const recentSummaries = memorySnap.docs
    .map((d) => (d.data() as { summary?: string }).summary ?? '')
    .reverse()
    .join('\n');

  const profileContext = `المستخدم: ${(userData as Record<string, string>).name ?? 'رائد أعمال'}. المجال: ${(userData as Record<string, string>).industry ?? 'غير محدد'}. المرحلة: ${(userData as Record<string, string>).startup_stage ?? 'بدايه'}.`;

  return `${profileContext}\n\nالسياق التاريخي:\n${recentSummaries}`;
}

/**
 * Summarizes the current conversation and saves it to the user's permanent memory.
 */
export async function summarizeAndStoreMemory(userId: string, messages: unknown[]): Promise<void> {
  if (messages.length < 2) return;

  const { text: summary } = await generateText({
    model: MODELS.FLASH,
    system: `أنت مسؤول عن إدارة الذاكرة الطويلة المدى لمنصة كلميرون تو.
        قم بتلخيص هذه المحادثة استراتيجياً. استخرج "الذاكرة العرضية" (Episodic Memory) والتي تشمل:
        1. نجاحات واضحة أو رؤى ممتازة تم التوصل إليها.
        2. إخفاقات أو عقبات تم اكتشافها.
        قدم الملخص في فقرة مركزة ومفيدة للقرارات المستقبلية.`,
    prompt: `المحادثة المستهدفة للتلخيص واستخراج الذاكرة العرضية:\n${JSON.stringify(messages.slice(-10))}`,
  });

  const memoryRef = collection(db, 'users', userId, 'memories');
  await addDoc(memoryRef, {
    summary,
    type: 'episodic_insight',
    createdAt: serverTimestamp(),
  });
}

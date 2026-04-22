// @ts-nocheck
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * يحلل الخطاب في المستندات ويستخرج العلاقات بينها.
 */
export async function analyzeDiscourse(documents: string[]): Promise<{
  mainClaims: string[];
  supportingEvidence: Map<string, string[]>;
  contradictions: Array<{ claim1: string; claim2: string }>;
}> {
  const prompt = `
  حلل المستندات التالية واستخرج:
  1. الادعاءات الرئيسية (main claims)
  2. الأدلة الداعمة لكل ادعاء (supporting evidence)
  3. أي تعارضات بين الادعاءات (contradictions)
  
  أعد النتيجة بتنسيق JSON:
  {
    "mainClaims": ["ادعاء 1", "ادعاء 2"],
    "supportingEvidence": { "ادعاء 1": ["دليل 1", "دليل 2"] },
    "contradictions": [{"claim1": "ادعاء 1", "claim2": "ادعاء 2"}]
  }
  
  المستندات:
  ${documents.map((doc, i) => `[مستند ${i+1}]: ${doc.substring(0, 1000)}`).join('\n\n')}
  
  تحليل JSON:`;
  
  const result = await generateText({
    model: google('gemini-2.5-pro'), // نموذج أقوى للتحليل العميق
    prompt,
    maxTokens: 1000,
    temperature: 0.1,
  });
  
  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        mainClaims: parsed.mainClaims || [],
        supportingEvidence: new Map(Object.entries(parsed.supportingEvidence || {})),
        contradictions: parsed.contradictions || [],
      };
    }
  } catch (e) {
    console.error('Failed to parse discourse analysis:', e);
  }
  
  return { mainClaims: [], supportingEvidence: new Map(), contradictions: [] };
}

/**
 * يبني رسمًا بيانيًا للعلاقات البلاغية بين المستندات.
 */
export async function buildRhetoricalGraph(documents: string[]): Promise<{
  nodes: Array<{ id: string; type: 'claim' | 'evidence'; content: string }>;
  edges: Array<{ from: string; to: string; relation: 'supports' | 'contradicts' | 'elaborates' }>;
}> {
  const discourse = await analyzeDiscourse(documents);
  
  const nodes: any[] = [];
  const edges: any[] = [];
  
  // إضافة الادعاءات كعقد
  discourse.mainClaims.forEach((claim, i) => {
    nodes.push({ id: `claim_${i}`, type: 'claim', content: claim });
  });
  
  // إضافة الأدلة كعقد وربطها بالادعاءات
  let evidenceIndex = 0;
  discourse.supportingEvidence.forEach((evidenceList, claim) => {
    const claimNode = nodes.find(n => n.content === claim);
    if (claimNode) {
      evidenceList.forEach(evidence => {
        const evidenceId = `evidence_${evidenceIndex++}`;
        nodes.push({ id: evidenceId, type: 'evidence', content: evidence });
        edges.push({ from: evidenceId, to: claimNode.id, relation: 'supports' });
      });
    }
  });
  
  // إضافة التعارضات كحواف
  discourse.contradictions.forEach((contradiction, i) => {
    const claim1Node = nodes.find(n => n.content === contradiction.claim1);
    const claim2Node = nodes.find(n => n.content === contradiction.claim2);
    if (claim1Node && claim2Node) {
      edges.push({ from: claim1Node.id, to: claim2Node.id, relation: 'contradicts' });
    }
  });
  
  return { nodes, edges };
}

/**
 * يولد إجابة مبنية على التحليل العميق للخطاب، مع معالجة التعارضات بذكاء.
 */
export async function discoGenerateAnswer(
  query: string,
  documents: string[],
  rhetoricalGraph: any
): Promise<string> {
  const contradictions = rhetoricalGraph.edges.filter((e: any) => e.relation === 'contradicts');
  
  const prompt = `
  أنت مساعد ذكي. أجب عن الاستعلام بناءً على المستندات المقدمة.
  ${contradictions.length > 0 ? 'لاحظ أن هناك تعارضات بين بعض المعلومات. قدم إجابة متوازنة تشير إلى وجهات النظر المختلفة.' : ''}
  
  الاستعلام: ${query}
  
  المستندات:
  ${documents.map((doc, i) => `[${i+1}]: ${doc}`).join('\n\n')}
  
  الإجابة:`;
  
  const result = await generateText({
    model: google('gemini-2.5-pro'),
    prompt,
    maxTokens: 1000,
    temperature: 0.3,
  });
  
  return result.text.trim();
}

/**
 * دالة Disco-RAG الرئيسية: تدمج البحث والتحليل والإجابة في سير عمل واحد.
 */
export async function discoRAG(
  query: string,
  retrieveFn: (q: string) => Promise<string[]>
): Promise<{ answer: string; rhetoricalGraph: any; discourse: any }> {
  // 1. استرجاع المستندات
  const documents = await retrieveFn(query);
  
  // 2. تحليل الخطاب وبناء الرسم البياني
  const discourse = await analyzeDiscourse(documents);
  const rhetoricalGraph = await buildRhetoricalGraph(documents);
  
  // 3. توليد الإجابة مع مراعاة التحليل
  const answer = await discoGenerateAnswer(query, documents, rhetoricalGraph);
  
  return { answer, rhetoricalGraph, discourse };
}

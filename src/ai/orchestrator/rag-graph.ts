import { StateGraph, Annotation, MemorySaver } from '@langchain/langgraph';
import { generateText, embed } from 'ai';
import { MODELS } from '@/src/lib/gemini';

// تعريف حالة RAG المتقدمة
export const RAGState = Annotation.Root({
  question: Annotation<string>(),
  originalQuestion: Annotation<string>(),
  hypotheticalAnswer: Annotation<string>(),
  documents: Annotation<any[]>({
    reducer: (a, b) => a.concat(b),
  }),
  gradedDocuments: Annotation<any[]>(),
  needsWebSearch: Annotation<boolean>(),
  discourseAnalysis: Annotation<string>(),
  answerPlan: Annotation<string>(),
  finalAnswer: Annotation<string>(),
  evaluationScore: Annotation<number>(),
  retries: Annotation<number>(),
});

// 1. توليد إجابة افتراضية (HyDE)
async function hydeGenerateNode(state: typeof RAGState.State) {
  const { text: hypotheticalAnswer } = await generateText({
    model: MODELS.FLASH,
    prompt: `قدم إجابة افتراضية مختصرة جداً لهذا السؤال بغرض استخدامها في البحث الدلالي:\nالسؤال: ${state.question}`,
  });
  return { hypotheticalAnswer, originalQuestion: state.question, retries: state.retries || 0 };
}

// 2. البحث الهجين الأولي (Baseline Hybrid RAG)
async function retrieveNode(state: typeof RAGState.State) {
  // محاكاة البحث الهجين في Milvus/ChromaDB (Semantic + Keyword BM25)
  // في بيئة حقيقية سيتم استخدام queryEmbedding و text search
  const mockDocs = [
    { content: "التشريعات المصرية لعام 2026 تلزم الشركات الناشئة بامتلاك سجل تجاري قبل التمويل.", score: 0.82 },
    { content: "بعض الدراسات تشير إلى أن التسويق الرقمي يحقق 60% من المبيعات، بينما دراسات أخرى تؤكد تراجعه.", score: 0.75 }
  ];
  return { documents: mockDocs };
}

// 3. المراجع (CRAG) - تقييم المستندات
async function gradeDocumentsNode(state: typeof RAGState.State) {
  const docs = state.documents;
  let correctCount = 0;
  let ambiguousCount = 0;
  let incorrectCount = 0;

  const gradedDocs = [];
  
  for (const doc of docs) {
    // محاكاة استخدام نموذج لتقييم صلة كل مستند بالسؤال
    const grade = doc.score > 0.8 ? 'correct' : (doc.score > 0.6 ? 'ambiguous' : 'incorrect');
    gradedDocs.push({ ...doc, grade });
    
    if (grade === 'correct') correctCount++;
    else if (grade === 'ambiguous') ambiguousCount++;
    else incorrectCount++;
  }
  
  return { gradedDocuments: gradedDocs };
}

// 4. توجيه ما بعد التقييم
function routeAfterGrading(state: typeof RAGState.State) {
  const docs = state.gradedDocuments;
  const incorrectCount = docs.filter(d => d.grade === 'incorrect').length;
  const ambiguousCount = docs.filter(d => d.grade === 'ambiguous').length;
  
  if (incorrectCount === docs.length) return 'rewrite_query';
  if (ambiguousCount > 0) return 'web_search';
  return 'analyze_discourse';
}

// 5. مسار التصحيح: إعادة الصياغة
async function rewriteQueryNode(state: typeof RAGState.State) {
  const { text: rewrittenQuery } = await generateText({
    model: MODELS.FLASH,
    prompt: `أعد صياغة هذا السؤال ليكون مناسباً لعملية استرجاع بيانات أكثر دقة:\n${state.question}`,
  });
  return { question: rewrittenQuery, documents: [] };
}

// 6. مسار التصحيح: البحث على الويب
async function webSearchNode(state: typeof RAGState.State) {
  // محاكاة الاستعانة بـ Tavily أو محركات بحث لزيادة السياق الغامض
  const fallbackDocs = [{ content: "معلومات من الويب: التأسيس الإلكتروني متاح الآن عبر بوابة المستثمر.", grade: 'correct' }];
  return { gradedDocuments: [...state.gradedDocuments, ...fallbackDocs] };
}

// 7. المحلل (Disco-RAG) - تحليل الخطاب
async function analyzeDiscourseNode(state: typeof RAGState.State) {
  const validDocs = state.gradedDocuments.filter(d => d.grade !== 'incorrect');
  const context = validDocs.map(d => d.content).join('\n');
  
  const { text: analysis } = await generateText({
    model: MODELS.FLASH,
    prompt: `حلل العلاقات المنطقية والخطابية في هذه المستندات واستخرج المتناقضات والتوافقات:\n${context}`,
  });
  return { discourseAnalysis: analysis };
}

// 8. المخطط (Disco-RAG) - تخطيط الإجابة
async function planAnswerNode(state: typeof RAGState.State) {
  const { text: plan } = await generateText({
    model: MODELS.FLASH,
    prompt: `بناءً على هذا التحليل، ضع مخططاً مفصلاً للإجابة على سؤال "${state.question}":\n${state.discourseAnalysis}`,
  });
  return { answerPlan: plan };
}

// 9. توليد الإجابة
async function generateAnswerNode(state: typeof RAGState.State) {
  const context = state.gradedDocuments.filter(d => d.grade !== 'incorrect').map(d => d.content).join('\n');
  const { text: finalAnswer } = await generateText({
    model: MODELS.PRO_PREVIEW,
    prompt: `استخدم المخطط التالي لبناء إجابة نهائية دقيقة للسؤال "${state.question}".\n\nالمخطط:\n${state.answerPlan}\n\nالمصادر:\n${context}`,
  });
  return { finalAnswer };
}

// 10. المكرر (SCIM) - تقييم الإجابة
async function evaluateAnswerNode(state: typeof RAGState.State) {
  const { text: evalResult } = await generateText({
    model: MODELS.FLASH,
    prompt: `قيم هذه الإجابة من حيث الدقة، الاكتمال، الاستناد للمصادر، والتماسك (أعطِ رقماً من 1 إلى 10 فقط):\nالسؤال: ${state.question}\nالإجابة: ${state.finalAnswer}`,
  });
  
  const score = parseInt(evalResult.trim()) || 5;
  return { evaluationScore: score, retries: state.retries + 1 };
}

// 11. توجيه ما بعد التقييم النهائي
function routeAfterEvaluation(state: typeof RAGState.State) {
  if (state.evaluationScore >= 8 || state.retries >= 3) {
    return '__end__';
  } else {
    return 'rewrite_query';
  }
}

// بناء رسم سير العمل
export const advancedRagWorkflow = new StateGraph(RAGState)
  .addNode('hyde_generate', hydeGenerateNode)
  .addNode('retrieve', retrieveNode)
  .addNode('grade_documents', gradeDocumentsNode)
  .addNode('rewrite_query', rewriteQueryNode)
  .addNode('web_search', webSearchNode)
  .addNode('analyze_discourse', analyzeDiscourseNode)
  .addNode('plan_answer', planAnswerNode)
  .addNode('generate_answer', generateAnswerNode)
  .addNode('evaluate_answer', evaluateAnswerNode)
  
  .addEdge('__start__', 'hyde_generate')
  .addEdge('hyde_generate', 'retrieve')
  .addEdge('retrieve', 'grade_documents')
  
  .addConditionalEdges('grade_documents', routeAfterGrading)
  
  .addEdge('rewrite_query', 'retrieve')
  .addEdge('web_search', 'analyze_discourse')
  
  .addEdge('analyze_discourse', 'plan_answer')
  .addEdge('plan_answer', 'generate_answer')
  .addEdge('generate_answer', 'evaluate_answer')
  
  .addConditionalEdges('evaluate_answer', routeAfterEvaluation);

const checkpointer = new MemorySaver();

export const selfCorrectingRAG = advancedRagWorkflow.compile({
  checkpointer,
});

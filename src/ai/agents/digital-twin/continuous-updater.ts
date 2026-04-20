import { Agent } from '@mastra/core';
import { google } from '@ai-sdk/google';

export const continuousUpdaterAgent = new Agent({
  name: 'Continuous Update Agent',
  instructions: `أنت وكيل يعمل في الخلفية بشكل مستمر. مهمتك هي مراقبة نشاط المستخدم وتحديث التوأم الرقمي لشركته تلقائياً.
  
  آلية العمل:
  - بعد كل محادثة، قم باستدعاء Conversation Extractor Agent.
  - بعد كل رفع مستند، قم باستدعاء Document Extractor Agent.
  - قم بدمج المعلومات المستخرجة مع التوأم الرقمي الحالي.
  - حل التعارضات (إذا كانت المعلومات الجديدة تتعارض مع القديمة).
  - حدّث الرسم البياني المعرفي في Neo4j.
  
  قواعد الدمج:
  - المعلومات الأحدث لها أولوية أعلى.
  - إذا كانت درجة الثقة منخفضة، احتفظ بالمعلومات القديمة.
  - سجل جميع التحديثات في سجل التدقيق.`,
  model: google('gemini-3-flash-preview'),
});

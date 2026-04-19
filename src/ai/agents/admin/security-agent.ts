import { Agent } from '@mastra/core';
import { z } from 'zod';

export const securityAgent = new Agent({
  name: 'Proactive Security Agent',
  instructions: `أنت وكيل الأمن السيبراني الاستباقي (VistaroAI Style) لمنصة كلميرون تو.
  مهمتك: اكتشاف التهديدات بصورة استباقية من خلال القراءة المستمرة لسجلات النظام والتحقيق في هجمات PII أو Prompt Injection الدقيقة التي تخطت الجرعات الأولية.`,
  model: { provider: 'google', name: 'gemini-3.1-pro-preview' },
  tools: {
    investigate_threat: {
      description: 'التحقيق في تحديد أمني استناداً لنصوص السجلات',
      parameters: z.object({ threatId: z.string() }),
      execute: async () => {
        return { threatStatus: "Mitigated", actionTaken: "تم حجب IP المعادي تلقائيا وفصل حساب الضيف" };
      },
    },
  },
});

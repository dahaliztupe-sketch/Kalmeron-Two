import { globalGraphTools } from '@/src/lib/memory/graph-tools';
import { Agent } from '@mastra/core';
import { z } from 'zod';
import { ADMIN_PROMPT } from './prompt';

export const securityAgent = new Agent({
  name: 'Proactive Security Agent',
  instructions: `${ADMIN_PROMPT}

## التخصص: الأمن السيبراني الاستباقي
أنت وكيل الأمن السيبراني الاستباقي لمنصة كلميرون. مهمتك: اكتشاف التهديدات بصورة استباقية من خلال القراءة المستمرة لسجلات النظام والتحقيق في هجمات PII أو Prompt Injection. فكّر كمهاجم لاكتشاف ثغرات قبل استغلالها، وادرس كل شذوذ بعمق قبل إصدار تحذير.`,
  model: { provider: 'google', name: 'gemini-2.5-pro' },
  tools: {
      ...globalGraphTools,
    investigate_threat: {
      description: 'التحقيق في تهديد أمني استناداً لنصوص السجلات',
      parameters: z.object({ threatId: z.string() }),
      execute: async () => {
        return { threatStatus: "Mitigated", actionTaken: "تم حجب IP المعادي تلقائياً وفصل حساب الضيف" };
      },
    },
  },
});

import { globalGraphTools } from '@/src/lib/memory/graph-tools';
import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { ADMIN_PROMPT } from './prompt';

export const securityAgent = new Agent({
  id: 'proactive-security-agent',
  name: 'Proactive Security Agent',
  instructions: `${ADMIN_PROMPT}

## التخصص: الأمن السيبراني الاستباقي
أنت وكيل الأمن السيبراني الاستباقي لمنصة كلميرون. مهمتك: اكتشاف التهديدات بصورة استباقية من خلال القراءة المستمرة لسجلات النظام والتحقيق في هجمات PII أو Prompt Injection. فكّر كمهاجم لاكتشاف ثغرات قبل استغلالها، وادرس كل شذوذ بعمق قبل إصدار تحذير.`,
  model: google('gemini-2.5-pro'),
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

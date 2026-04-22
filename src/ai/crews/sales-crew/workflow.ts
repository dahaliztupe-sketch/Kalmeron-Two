// @ts-nocheck
import { Mastra, Agent, Workflow } from '@mastra/core';
import { z } from 'zod';

// 1. Prospecting Agent (AI SDR)
export const prospectingAgent = new Agent({
  name: 'Prospecting Agent',
  instructions: 'أنت خبير مبيعات (SDR). مهمتك البحث عن العملاء المحتملين وتأهيلهم بناءً على معايير محددة.',
  model: { provider: 'google', name: 'gemini-2.5-flash-lite' } // Cost optimization via Gateway
});

// 2. Content Writer Agent
export const contentWriterAgent = new Agent({
  name: 'Content Writer Agent',
  instructions: 'أنت كاتب محتوى تسويقي. مهمتك كتابة رسائل تواصل باردة (Cold Emails, LinkedIn DMs) مقنعة وعالية التحويل.',
  model: { provider: 'google', name: 'gemini-2.5-flash' } 
});

// 3. Campaign Analyst Agent
export const campaignAnalystAgent = new Agent({
  name: 'Campaign Analyst Agent',
  instructions: 'أنت محلل بيانات حملات تسويقية. هدفك تحليل معدلات الفتح والنقر واقتراح تحسينات للرسائل.',
  model: { provider: 'google', name: 'gemini-2.5-pro' } // Deep analysis
});

// Mastra Workflow Setup
export const salesWorkflow = new Workflow({
  name: 'Sales and Marketing Automation',
  triggerSchema: z.object({
    targetIndustry: z.string(),
    targetRole: z.string(),
    valueProposition: z.string(),
  }),
});

salesWorkflow
  .step('find_prospects', async ({ data }) => {
    const response = await prospectingAgent.generate(`Find ideal prospects for industry: ${data.targetIndustry}, role: ${data.targetRole}`);
    return { prospects: response.text };
  })
  .step('write_content', async ({ data, steps }) => {
    const prospects = steps.find_prospects.result.prospects;
    const response = await contentWriterAgent.generate(`Write personalized outreach for these prospects: ${prospects}. Value Prop: ${data.valueProposition}`);
    return { outreachContent: response.text };
  })
  .step('analyze_strategy', async ({ data, steps }) => {
    const content = steps.write_content.result.outreachContent;
    const response = await campaignAnalystAgent.generate(`Analyze this outreach content and provide A/B test variations: ${content}`);
    return { analysis: response.text };
  });

salesWorkflow.commit();

export const executeSalesCrew = async (params: { targetIndustry: string, targetRole: string, valueProposition: string }) => {
  const run = await salesWorkflow.execute(params);
  return run.results;
};

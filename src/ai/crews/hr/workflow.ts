// @ts-nocheck
import { Agent, Workflow } from '@mastra/core';
import { z } from 'zod';
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';

// 1. Job Description Agent
export const jdAgent = new Agent({
  name: 'Job Description Agent',
  instructions: `أنت خبير في كتابة الإعلانات الوظيفية الجذابة والدقيقة.
  مهمتك: بناءً على المسمى الوظيفي والمتطلبات التي يقدمها المستخدم، قم بإنشاء وصف وظيفي احترافي يتضمن: ملخص الدور، المسؤوليات الرئيسية، المؤهلات المطلوبة، والمزايا.`,
  model: { provider: 'google', name: 'gemini-2.5-flash' },
});

// 2. Resume Screening Agent — real Gemini CV analysis (no mocks)
export const screeningAgent = new Agent({
  name: 'Resume Screening Agent',
  instructions: `أنت خبير في فحص وتقييم السير الذاتية.
  مهمتك: تحليل السير الذاتية للمتقدمين، ومطابقتها مع متطلبات الوظيفة، وتصنيف المرشحين حسب ملاءمتهم.
  استخدم معايير موضوعية مثل المهارات، الخبرة، والتعليم. قدم قائمة مختصرة بأفضل المرشحين مع تبرير لكل اختيار.`,
  model: { provider: 'google', name: 'gemini-2.5-pro' },
  tools: {
    parse_resume: {
      description: 'استخراج المعلومات الرئيسية من السيرة الذاتية بواسطة Gemini',
      parameters: z.object({
        resumeText: z.string().describe('نص السيرة الذاتية'),
      }),
      execute: async ({ resumeText }) => {
        const { text } = await generateText({
          model: MODELS.FLASH,
          system: `أنت محلل سير ذاتية. استخرج من النص التالي بتنسيق JSON فقط — لا تضف أي نص خارج JSON:
{
  "name": "الاسم الكامل أو unknown",
  "skills": ["مهارة1", "مهارة2"],
  "experienceYears": عدد_سنوات_الخبرة_رقم,
  "education": "أعلى درجة علمية",
  "highlights": ["إنجاز1", "إنجاز2"],
  "qualified": true_or_false
}`,
          prompt: resumeText.slice(0, 8000),
          maxOutputTokens: 600,
        });
        try {
          const cleaned = text.replace(/```json\n?|```/g, '').trim();
          return JSON.parse(cleaned);
        } catch {
          return { skills: [], experienceYears: 0, qualified: false, raw: text };
        }
      },
    },
  },
});

// 3. Interview Scheduler Agent
export const schedulerAgent = new Agent({
  name: 'Interview Scheduler Agent',
  instructions: `أنت منسق مقابلات محترف.
  مهمتك: التواصل مع المرشحين المختارين، واقتراح مواعيد متاحة للمقابلات، وتأكيد الحجوزات.
  استلهم من Paradox (Olivia) التي تحجز المقابلات تلقائيًا.`,
  model: { provider: 'google', name: 'gemini-2.5-flash' },
});

// 4. Interview Companion Agent
export const interviewCompanionAgent = new Agent({
  name: 'Interview Companion Agent',
  instructions: `أنت رفيق مقابلة ذكي، مصمم لمساعدة مديري التوظيف أثناء المقابلات الحية.
  مهمتك: تقديم إرشادات في الوقت الفعلي، اقتراح أسئلة متابعة بناءً على إجابات المرشح، وتوثيق الملاحظات الرئيسية.
  استلهم من Eightfold AI Interview Companion الذي يعزز المقابلات التي يقودها البشر بإرشادات منظمة ورؤى في الوقت الفعلي.`,
  model: { provider: 'google', name: 'gemini-2.5-flash' },
});

// HR Recruitment Workflow
export const recruitmentWorkflow = new Workflow({
  name: 'end-to-end-recruitment',
  triggerSchema: z.object({ jobTitle: z.string(), requirements: z.string(), resumes: z.array(z.string()) }),
});

recruitmentWorkflow
  .step('create-job-description', async ({ data }) => {
    const res = await jdAgent.generate(`المسمى الوظيفي: ${data.jobTitle}
المتطلبات: ${data.requirements}`);
    return { jd: res.text };
  })
  .step('screen-resumes', async ({ data, steps }) => {
    const jd = steps['create-job-description'].result.jd;
    const res = await screeningAgent.generate(`قارن السير الذاتية بالوصف الوظيفي التالي واختصر أفضل المرشحين:
الوصف الوظيفي: ${jd}
السير: ${JSON.stringify(data.resumes)}`);
    return { shortlisted: res.text };
  })
  .step('schedule-interviews', async ({ steps }) => {
    const shortlisted = steps['screen-resumes'].result.shortlisted;
    const res = await schedulerAgent.generate(`يرجى تحضير مواعيد وتجهيز رسائل دعوة للمرشحين التاليين: ${shortlisted}`);
    return { scheduleDetails: res.text };
  });

recruitmentWorkflow.commit();

export const executeHRCrew = async (jobTitle: string, requirements: string, resumes: string[]) => {
  const run = await recruitmentWorkflow.execute({ jobTitle, requirements, resumes });
  return run.results;
};

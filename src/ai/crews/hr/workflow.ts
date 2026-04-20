// @ts-nocheck
import { Agent, Workflow } from '@mastra/core';
import { z } from 'zod';

// 1. Job Description Agent
export const jdAgent = new Agent({
  name: 'Job Description Agent',
  instructions: `أنت خبير في كتابة الإعلانات الوظيفية الجذابة والدقيقة.
  مهمتك: بناءً على المسمى الوظيفي والمتطلبات التي يقدمها المستخدم، قم بإنشاء وصف وظيفي احترافي يتضمن: ملخص الدور، المسؤوليات الرئيسية، المؤهلات المطلوبة، والمزايا.`,
  model: { provider: 'google', name: 'gemini-3-flash-preview' },
});

// 2. Resume Screening Agent
export const screeningAgent = new Agent({
  name: 'Resume Screening Agent',
  instructions: `أنت خبير في فحص وتقييم السير الذاتية.
  مهمتك: تحليل السير الذاتية للمتقدمين، ومطابقتها مع متطلبات الوظيفة، وتصنيف المرشحين حسب ملاءمتهم.
  استخدم معايير موضوعية مثل المهارات، الخبرة، والتعليم. قدم قائمة مختصرة بأفضل المرشحين مع تبرير لكل اختيار.`,
  // Complex analysis => Pro preview
  model: { provider: 'google', name: 'gemini-3.1-pro-preview' },
  tools: {
    parse_resume: {
      description: 'استخراج المعلومات الرئيسية من السيرة الذاتية',
      parameters: z.object({
        resumeText: z.string().describe('نص السيرة الذاتية'),
      }),
      execute: async ({ resumeText }) => {
        return { 
          skills: ['React', 'Next.js', 'Typescript'], 
          experienceYears: 4, 
          qualified: true 
        };
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
  // Simple scheduling => Flash Lite
  model: { provider: 'google', name: 'gemini-3.1-flash-lite-preview' },
});

// 4. Interview Companion Agent
export const interviewCompanionAgent = new Agent({
  name: 'Interview Companion Agent',
  instructions: `أنت رفيق مقابلة ذكي، مصمم لمساعدة مديري التوظيف أثناء المقابلات الحية.
  مهمتك: تقديم إرشادات في الوقت الفعلي، اقتراح أسئلة متابعة بناءً على إجابات المرشح، وتوثيق الملاحظات الرئيسية.
  استلهم من Eightfold AI Interview Companion الذي يعزز المقابلات التي يقودها البشر بإرشادات منظمة ورؤى في الوقت الفعلي.`,
  model: { provider: 'google', name: 'gemini-3-flash-preview' },
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

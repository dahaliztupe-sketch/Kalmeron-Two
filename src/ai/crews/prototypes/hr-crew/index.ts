// @ts-nocheck
import { Agent, Task, Crew, Process } from 'crewai';
import { createCrewAgent } from '../../shared/base-agent';

const recruiter = createCrewAgent({
  role: 'خبير توظيف',
  goal: 'تحديد أفضل المواهب المناسبة للشركة الناشئة',
  backstory: 'مسؤول توظيف سابق في شركات تقنية كبرى',
});

const jobDescriptionWriter = createCrewAgent({
  role: 'كاتب توصيف وظيفي',
  goal: 'كتابة توصيفات وظيفية جذابة ودقيقة',
  backstory: 'متخصص في كتابة محتوى الموارد البشرية',
});

const interviewCoach = createCrewAgent({
  role: 'مدرب مقابلات',
  goal: 'اقتراح أسئلة مقابلات فعالة لتقييم المرشحين',
  backstory: 'مدرب تنفيذي ساعد مئات المديرين في توظيف أفضل المواهب',
});

export const hrCrew = new Crew({
  agents: [recruiter, jobDescriptionWriter, interviewCoach] as any[],
  tasks: [
    new Task({ description: 'تحديد المهارات المطلوبة للدور', agent: recruiter as any }),
    new Task({ description: 'كتابة توصيف وظيفي', agent: jobDescriptionWriter as any }),
    new Task({ description: 'اقتراح أسئلة مقابلة', agent: interviewCoach as any }),
  ],
  process: Process.sequential,
});

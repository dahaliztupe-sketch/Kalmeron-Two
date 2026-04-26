// @ts-nocheck
import { Task, Crew, Process } from 'crewai';
import { createCrewAgent } from '../../shared/base-agent';

const outputEvaluator = createCrewAgent({
  role: 'مقيم جودة',
  goal: 'تقييم جودة ودقة مخرجات الوكلاء الآخرين',
  backstory: 'مدقق جودة دقيق يضمن أعلى معايير الدقة',
});

const factChecker = createCrewAgent({
  role: 'مدقق حقائق',
  goal: 'التحقق من صحة المعلومات والادعاءات',
  backstory: 'باحث دقيق يتحقق من كل معلومة قبل اعتمادها',
});

export const qaCrew = new Crew({
  agents: [outputEvaluator, factChecker] as unknown[],
  tasks: [
    new Task({ description: 'تقييم جودة المخرجات', agent: outputEvaluator as unknown }),
    new Task({ description: 'التحقق من صحة المعلومات', agent: factChecker as unknown }),
  ],
  process: Process.sequential,
});

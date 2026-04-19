// @ts-nocheck
import { Task, Crew, Process } from 'crewai';
import { createCrewAgent } from '../../shared/base-agent';

// وكيل استراتيجي التسويق
const marketingStrategist = createCrewAgent({
  role: 'خبير استراتيجي تسويق',
  goal: 'تطوير استراتيجية تسويق شاملة وفعالة للشركة الناشئة',
  backstory: 'مستشار تسويق مخضرم مع 15 سنة خبرة في السوق المصري والعربي',
});

// وكيل منشئ المحتوى
const contentCreator = createCrewAgent({
  role: 'منشئ محتوى إبداعي',
  goal: 'إنشاء محتوى تسويقي جذاب ومقنع للجمهور المستهدف',
  backstory: 'كاتب محتوى متخصص في تحويل الأفكار المعقدة إلى رسائل بسيطة وقوية',
});

// وكيل تحليلات التسويق
const marketingAnalyst = createCrewAgent({
  role: 'محلل تسويق',
  goal: 'تحليل أداء الحملات التسويقية وتقديم توصيات للتحسين',
  backstory: 'محلل بيانات تسويقية متخصص في قياس العائد على الاستثمار',
});

// المهام
const strategyTask = new Task({
  description: 'تطوير استراتيجية تسويق لمشروع {project_name} في قطاع {industry}',
  agent: marketingStrategist as any,
});

const contentTask = new Task({
  description: 'إنشاء محتوى تسويقي للقنوات المختلفة (سوشيال ميديا، بريد إلكتروني، موقع)',
  agent: contentCreator as any,
});

const analysisTask = new Task({
  description: 'تحليل المنافسين وتحديد فرص السوق',
  agent: marketingAnalyst as any,
});

// الطاقم
export const marketingCrew = new Crew({
  agents: [marketingStrategist, contentCreator, marketingAnalyst] as any[],
  tasks: [strategyTask, contentTask, analysisTask],
  process: Process.sequential,
  verbose: true,
});

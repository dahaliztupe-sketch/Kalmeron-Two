import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CFO_SYSTEM_PROMPT } from './prompt';
import * as tools from './tools';

export async function cfoAgentAction(task: string, parameters: any) {
    let result: any;
    
    switch (task) {
        case 'analyze-scenario':
            result = await tools.runScenarioAnalysis(parameters.baseModel, parameters.scenario);
            break;
        case 'evaluate-investment':
            result = await tools.evaluateInvestment(parameters);
            break;
        default:
            result = "المهمة غير مدعومة حالياً";
    }

    const { text } = await generateText({
        model: MODELS.PRO,
        system: CFO_SYSTEM_PROMPT,
        prompt: `النتيجة التقنية هي: ${JSON.stringify(result)}. قم بشرحها وإعطاء رؤية استراتيجية للمستخدم.`
    });

    return text;
}

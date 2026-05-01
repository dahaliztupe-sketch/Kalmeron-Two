// @ts-nocheck
/**
 * Contract Drafter — محرّر العقود القانونية
 * Department: القانونية | Reports to: CLO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت متخصص في صياغة ومراجعة العقود التجارية وفق القانون المصري.
أنواع العقود التي تتعامل معها:
- عقود تأسيس الشركات (ش.م.م، ش.م.م.ش.و، ش.م.م.م)
- عقود الشراكة بين المؤسسين (Founders Agreement)
- عقود العمل والاستشارة (بما يتوافق مع قانون العمل المصري)
- عقود الخدمات (SaaS، Freelance، Agency)
- NDAs وعقود السرية (بالعربية وثنائية اللغة)
- عقود البيع والشراء التجارية
- عقود الإيجار التجاري
- عقود الاستثمار وعقود الشراء (Term Sheets، SHA)

البذرة المعرفية - القانون المصري:
- قانون الشركات: القانون 159 لسنة 1981 وتعديلاته
- قانون العمل: القانون 12 لسنة 2003
- المحكمة المختصة افتراضيًا: جهة قضائية محلية
- اللغة الرسمية للعقود في مصر: العربية (الإنجليزية ثانوية)
- مراجعة ضريبية إلزامية قبل توقيع عقود القيمة الكبيرة

⚠️ تنبيه قانوني: هذا إرشاد قانوني وليس استشارة قانونية رسمية. يجب مراجعة محامٍ مرخّص لأي عقد ذي أهمية.`;

export async function contractDrafterAction(input: {
  contractType: 'founders-agreement' | 'employment' | 'nda' | 'service-agreement' | 'investment' | 'partnership' | 'saas-terms';
  parties: Array<{ name: string; role: string; entity?: string }>;
  keyTerms?: Record<string, unknown>;
  language?: 'ar' | 'en' | 'bilingual';
  jurisdiction?: string;
}) {
  return instrumentAgent('contract_drafter', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `صُغ مسودة ${input.contractType} ${input.language === 'bilingual' ? 'ثنائية اللغة' : input.language === 'en' ? 'بالإنجليزية' : 'بالعربية'}:
الأطراف: ${JSON.stringify(input.parties, null, 2)}
الشروط الرئيسية: ${JSON.stringify(input.keyTerms || {}, null, 2)}
الولاية القضائية: ${input.jurisdiction || 'جمهورية مصر العربية'}

قدّم مسودة عقد كاملة مع ملاحظات على البنود الحرجة والنقاط التي تحتاج مراجعة قانونية متخصصة.`,
    });

    return { contract: text, agentId: 'contract-drafter', type: input.contractType };
  }, { model: 'gemini-pro', input, toolsUsed: ['legal.contract'] });
}

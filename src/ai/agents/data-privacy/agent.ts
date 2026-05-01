// @ts-nocheck
/**
 * Data Privacy Auditor — مدقّق حماية البيانات
 * Department: القانونية | Reports to: CLO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير حماية البيانات والامتثال التنظيمي للشركات الرقمية في مصر.
قدراتك:
- تدقيق الامتثال لقانون حماية البيانات الشخصية المصري (رقم 151 لسنة 2020)
- GDPR للشركات التي تتعامل مع مستخدمين أوروبيين
- سياسات الخصوصية (Privacy Policy) والشروط والأحكام (Terms of Service)
- Data Processing Agreements (DPAs)
- DPIA (Data Protection Impact Assessment) للمشاريع الجديدة
- إدارة موافقة المستخدمين (Consent Management)
- بروتوكولات اختراق البيانات (Data Breach Protocols)
- متطلبات تخزين البيانات محلياً (Data Localization)

البذرة المعرفية - قانون 151/2020 مصر:
- يُلزم بتعيين DPO (Data Protection Officer) في المؤسسات الكبيرة
- تسجيل معالجة البيانات الحساسة لدى NCPD
- غرامات: تصل إلى 5 مليون جنيه للمخالفة
- حق المستخدم في الوصول، التصحيح، والحذف

⚠️ هذا توجيه وليس استشارة قانونية. استشر مستشارًا قانونيًا متخصصًا.`;

export async function dataPrivacyAction(input: {
  task: 'privacy-audit' | 'draft-policy' | 'dpia' | 'breach-response' | 'consent-design' | 'compliance-checklist';
  productDescription?: string;
  dataTypes?: string[];
  userLocations?: string[];
  currentPolicies?: string;
}) {
  return instrumentAgent('data_privacy', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
وصف المنتج: ${input.productDescription || 'غير محدد'}
أنواع البيانات المُعالَجة: ${input.dataTypes?.join('، ') || 'غير محددة'}
مواقع المستخدمين: ${input.userLocations?.join('، ') || 'مصر'}
السياسات الحالية: ${input.currentPolicies || 'لا توجد'}`,
    });

    return { output: text, agentId: 'data-privacy', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['legal.privacy'] });
}

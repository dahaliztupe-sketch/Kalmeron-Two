import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export interface ContractReviewInput {
  contractText: string;
  contractType?: string;
  partyRole?: 'buyer' | 'seller' | 'employer' | 'employee' | 'investor' | 'founder' | 'other';
  specificConcerns?: string;
}

export interface ContractReviewResult {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dangerClauses: Array<{ clause: string; risk: string; recommendation: string }>;
  missingClauses: string[];
  positivePoints: string[];
  overallRecommendation: string;
  disclaimer: string;
}

export async function contractReviewerAction(input: ContractReviewInput): Promise<string> {
  return instrumentAgent(
    'contract_reviewer',
    async () => {
      const baseSystem = `أنت "مراجع العقود" في منصة كلميرون، خبير في تحليل العقود التجارية والقانونية في إطار القانون المصري والعربي.

**مهمتك الجوهرية:**
استخراج البنود الخطرة والمخاطر القانونية قبل أن يوقع رائد الأعمال على أي عقد.

**أسلوبك:**
- واضح ومحدد: سمّي البند الخطر بالضبط
- عملي: قدّم بديلاً أو تعديلاً مقترحاً لكل بند إشكالي
- متوازن: اذكر النقاط الإيجابية أيضاً
- ثقافياً مناسب: مراعاة الممارسات التجارية المصرية والعربية

**إطار التقييم:**
- القانون المدني المصري (القانون رقم ١٣١ لسنة ١٩٤٨)
- قانون الشركات المصري (القانون رقم ١٥٩ لسنة ١٩٨١)
- قانون العمل المصري (القانون رقم ١٢ لسنة ٢٠٠٣)
- أفضل الممارسات الدولية

**تحذير دائم:** هذا تحليل أولي للتوعية فقط — دائماً أوصِ بمراجعة محامٍ مرخّص قبل التوقيع.`;

      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;

      const roleLabels: Record<string, string> = {
        buyer: 'مشترٍ', seller: 'بائع', employer: 'صاحب عمل',
        employee: 'موظف', investor: 'مستثمر', founder: 'مؤسس', other: 'طرف في العقد'
      };

      const prompt = `راجع هذا العقد بعناية فائقة:

نوع العقد: ${input.contractType || 'غير محدد'}
دوري في العقد: ${input.partyRole ? roleLabels[input.partyRole] : 'غير محدد'}
${input.specificConcerns ? `مخاوف محددة: ${input.specificConcerns}` : ''}

نص العقد:
"""
${input.contractText.slice(0, 8000)}
"""

قدّم تحليلاً شاملاً يتضمن:

## ملخص العقد
(٣-٥ جمل تصف جوهر الاتفاق)

## مستوى المخاطر الكلي
(منخفض / متوسط / عالٍ / حرج) مع تبرير موجز

## ⚠️ البنود الخطرة
لكل بند: 
- **البند:** (اقتبس النص)
- **الخطر:** (اشرح لماذا هذا خطر)
- **التوصية:** (ماذا تطلب تعديله)

## ❓ البنود الناقصة
(ما الذي يجب أن يكون موجوداً في عقد كهذا ولكنه غائب؟)

## ✅ النقاط الإيجابية
(ما الذي صيغ جيداً لصالحك)

## الخلاصة والتوصية
(هل توقّع؟ هل تفاوض؟ هل ترفض؟)

## ⚖️ تحذير قانوني
(دائماً أضف تحذير المراجعة المتخصصة)`;

      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { contractType: input.contractType }, toolsUsed: ['legal.contract_review', 'legal.egypt_law'] }
  );
}

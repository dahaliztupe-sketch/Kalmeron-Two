// @ts-nocheck
/**
 * Recipes — وصفات جاهزة تربط أقسام متعددة في تدفّق واحد بضغطة زر.
 *
 * كل recipe = قائمة خطوات مُرتّبة. كل خطوة هي إجراء (action) من السجلّ مع
 * قيم مدخلة جزئياً، يُكمّلها المستخدم في النموذج قبل التنفيذ.
 *
 * الوصفات لا تتخطّى Human-in-the-Loop — كل خطوة "requiresApproval" تذهب
 * لصندوق موافقات المؤسّس كالمعتاد.
 */
import { z } from 'zod';

export interface RecipeStep {
  id: string;
  title: string;
  actionId: string;
  /** Default values pre-filled into the form for this step. */
  defaults?: Record<string, unknown>;
  /** Fields the user must fill (others use defaults). */
  requiredInputs?: string[];
  rationale: string;
}

export interface Recipe {
  id: string;
  title: string;
  emoji: string;
  category: 'launch' | 'fundraising' | 'sales' | 'hiring' | 'monthly_ops' | 'crisis' | 'marketing';
  description: string;
  estimatedDurationMin: number;
  involves: string[]; // department labels
  steps: RecipeStep[];
}

const RECIPES: Recipe[] = [
  {
    id: 'launch_multi_channel_ad_blast',
    title: 'حملة تسويقية متعدّدة المنصات',
    emoji: '📣',
    category: 'marketing',
    description: 'تشغيل حملة موحّدة على Meta + Google + TikTok مع متابعة بعد أسبوع.',
    estimatedDurationMin: 5,
    involves: ['التسويق', 'العمليات'],
    steps: [
      {
        id: 'meta',
        title: 'إنشاء حملة Meta',
        actionId: 'meta_create_campaign',
        defaults: { objective: 'OUTCOME_TRAFFIC', dailyBudgetMinor: 5000 },
        requiredInputs: ['name'],
        rationale: 'فيسبوك وإنستجرام عادة الأعلى وصولاً في مصر.',
      },
      {
        id: 'google',
        title: 'إنشاء حملة Google',
        actionId: 'google_ads_create_campaign',
        defaults: { channelType: 'SEARCH', dailyBudgetMinor: 5000 },
        requiredInputs: ['name'],
        rationale: 'بحث Google يلتقط النوايا الشرائية المباشرة.',
      },
      {
        id: 'tiktok',
        title: 'إنشاء حملة TikTok',
        actionId: 'tiktok_create_campaign',
        defaults: { objective: 'TRAFFIC', budgetMode: 'BUDGET_MODE_DAY', budgetAmountMinor: 5000 },
        requiredInputs: ['name'],
        rationale: 'الجمهور الأصغر سنّاً نشط بشدة هنا.',
      },
      {
        id: 'followup',
        title: 'تذكير لمراجعة الأداء بعد 7 أيام',
        actionId: 'ops_create_task',
        defaults: { title: 'مراجعة أداء الحملة الموحّدة', priority: 'high' },
        rationale: 'بدون متابعة، تستمر الحملة بعشوائية.',
      },
    ],
  },
  {
    id: 'hire_engineer_end_to_end',
    title: 'توظيف مهندس من الإعلان للعرض',
    emoji: '👨‍💻',
    category: 'hiring',
    description: 'نشر الوظيفة + جدولة الفرز + مهمّة لجمع السير الذاتية.',
    estimatedDurationMin: 4,
    involves: ['الموارد البشرية', 'العمليات'],
    steps: [
      {
        id: 'post',
        title: 'نشر إعلان الوظيفة',
        actionId: 'hr_post_job',
        defaults: { employmentType: 'full_time', department: 'الهندسة' },
        requiredInputs: ['title', 'description'],
        rationale: 'الإعلان أوّل خطوة — لا يلزم أي شيء قبله.',
      },
      {
        id: 'collect',
        title: 'مهمة: جمع 10 سير ذاتية مرشّحة',
        actionId: 'ops_create_task',
        defaults: { title: 'تجميع 10 CV مؤهّلة للوظيفة', priority: 'high' },
        rationale: 'بدون CVs لا يوجد ما نُفرز.',
      },
      {
        id: 'interview_slot',
        title: 'حجز موعد مقابلات',
        actionId: 'schedule_meeting',
        defaults: { title: 'مقابلات تقنية' },
        requiredInputs: ['startIso', 'endIso'],
        rationale: 'الأوقات تنفد بسرعة — احجز مبكراً.',
      },
    ],
  },
  {
    id: 'close_big_deal',
    title: 'إغلاق صفقة كبيرة',
    emoji: '🤝',
    category: 'sales',
    description: 'تحويل عميل إلى مرحلة العرض، مسوّدة عقد، إرسال للتوقيع.',
    estimatedDurationMin: 6,
    involves: ['المبيعات', 'القانوني', 'المالية'],
    steps: [
      {
        id: 'mark_proposal',
        title: 'تحديث حالة العميل إلى "عرض"',
        actionId: 'crm_update_lead_status',
        defaults: { status: 'proposal' },
        requiredInputs: ['leadId'],
        rationale: 'يفصل هذا العميل عن باقي القائمة في المتابعة.',
      },
      {
        id: 'draft',
        title: 'مسوّدة عقد بيع',
        actionId: 'legal_create_contract_draft',
        defaults: { kind: 'بيع/خدمات' },
        requiredInputs: ['parties', 'body'],
        rationale: 'أسرع للعميل من الانتظار لمحامٍ خارجي.',
      },
      {
        id: 'sign',
        title: 'إرسال العقد للتوقيع الإلكتروني',
        actionId: 'legal_send_for_signature',
        defaults: {},
        requiredInputs: ['documentName', 'documentBase64', 'recipientEmail', 'recipientName'],
        rationale: 'يوقّع العميل من جواله — لا تأخير ورقي.',
      },
      {
        id: 'invoice',
        title: 'إصدار مسوّدة فاتورة',
        actionId: 'create_invoice_draft',
        defaults: { currency: 'EGP' },
        requiredInputs: ['client', 'items'],
        rationale: 'ابدأ الفاتورة فور إرسال العقد لتسريع التحصيل.',
      },
    ],
  },
  {
    id: 'monthly_finance_close',
    title: 'إقفال شهري + تقرير للمستثمرين',
    emoji: '📊',
    category: 'monthly_ops',
    description: 'تقرير أرباح وخسائر، رفع للمستثمرين، إيميل خلاصة.',
    estimatedDurationMin: 5,
    involves: ['المالية', 'علاقات المستثمرين'],
    steps: [
      {
        id: 'pl',
        title: 'توليد تقرير P&L الشهري',
        actionId: 'cfo_generate_pl_report',
        defaults: {},
        requiredInputs: ['fromIso', 'toIso'],
        rationale: 'الصورة المالية أساس أي قرار.',
      },
      {
        id: 'data_room',
        title: 'إضافة التقرير لغرفة بيانات المستثمرين',
        actionId: 'investor_add_data_room_file',
        defaults: { category: 'financial', title: 'تقرير شهري P&L' },
        rationale: 'لتكون متاحة فور سؤال أي مستثمر.',
      },
      {
        id: 'email',
        title: 'إيميل خلاصة للمستثمرين',
        actionId: 'investor_send_pitch_email',
        defaults: { subject: 'تحديث الأداء الشهري' },
        requiredInputs: ['investorName', 'investorEmail', 'body'],
        rationale: 'الشفافية الدورية تبني الثقة وتسهّل جولات لاحقة.',
      },
    ],
  },
  {
    id: 'product_launch_full',
    title: 'إطلاق منتج جديد (شامل)',
    emoji: '🚀',
    category: 'launch',
    description: 'تخطيط تشغيلي + حملة تسويق + مادّة دعم + إعلان للمستثمرين.',
    estimatedDurationMin: 8,
    involves: ['العمليات', 'التسويق', 'خدمة العملاء', 'علاقات المستثمرين'],
    steps: [
      {
        id: 'plan',
        title: 'مهمّة: خطة الإطلاق',
        actionId: 'ops_create_task',
        defaults: { title: 'خطة إطلاق المنتج: مهام، مواعيد، مسؤوليات', priority: 'urgent' },
        rationale: 'بدون خطة، تتفرّق الجهود.',
      },
      {
        id: 'launch_campaign',
        title: 'حملة Meta للإطلاق',
        actionId: 'meta_create_campaign',
        defaults: { objective: 'OUTCOME_AWARENESS', dailyBudgetMinor: 10000 },
        requiredInputs: ['name'],
        rationale: 'ضخّ الوعي في الأسبوع الأوّل من الإطلاق.',
      },
      {
        id: 'support_ready',
        title: 'تذكرة دعم: تحضير قاعدة معرفة',
        actionId: 'support_create_ticket',
        defaults: {
          subject: 'إعداد KB لأسئلة المنتج الجديد',
          body: 'تحضير 10 أسئلة شائعة وإجاباتها قبل الإطلاق.',
          priority: 'high',
          channel: 'web',
        },
        requiredInputs: ['customerEmail'],
        rationale: 'يخفّض ضغط الدعم في الأسبوع الأوّل بشكل كبير.',
      },
      {
        id: 'investor_update',
        title: 'إعلان للمستثمرين',
        actionId: 'investor_send_pitch_email',
        defaults: { subject: 'إطلاق منتج جديد' },
        requiredInputs: ['investorName', 'investorEmail', 'body'],
        rationale: 'الإطلاقات قصص تمويلية مهمّة لجولات قادمة.',
      },
    ],
  },
  {
    id: 'fundraising_outreach',
    title: 'جولة تواصل مع المستثمرين',
    emoji: '💰',
    category: 'fundraising',
    description: 'رفع ملفّات الـ data room + إرسال بيتش لقائمة مستثمرين.',
    estimatedDurationMin: 4,
    involves: ['علاقات المستثمرين', 'القانوني'],
    steps: [
      {
        id: 'add_pitch',
        title: 'رفع البيتش deck',
        actionId: 'investor_add_data_room_file',
        defaults: { category: 'product', title: 'Pitch Deck' },
        requiredInputs: ['fileUrl'],
        rationale: 'المستند الأهم في أي محادثة استثمارية.',
      },
      {
        id: 'add_financials',
        title: 'رفع الملفّات المالية',
        actionId: 'investor_add_data_room_file',
        defaults: { category: 'financial', title: 'Financial Model & Statements' },
        requiredInputs: ['fileUrl'],
        rationale: 'يبحث المستثمر عنها فوراً.',
      },
      {
        id: 'pitch_email',
        title: 'إرسال بيتش لمستثمر',
        actionId: 'investor_send_pitch_email',
        defaults: {},
        requiredInputs: ['investorName', 'investorEmail', 'subject', 'body'],
        rationale: 'الإيميل يبدأ المحادثة — كرّر الخطوة لكل مستثمر.',
      },
    ],
  },
];

export function getRecipes(): Recipe[] {
  return RECIPES;
}

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}

export const RecipeRunSchema = z.object({
  recipeId: z.string(),
  steps: z.array(
    z.object({
      stepId: z.string(),
      input: z.any(),
    }),
  ),
  rationale: z.string().min(10),
});

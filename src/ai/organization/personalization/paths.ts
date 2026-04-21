// @ts-nocheck
  /**
   * Personalized Paths — مسارات مخصصة لكل فئة مستهدفة في السوق المصري.
   */
  import type { DepartmentId } from '../governance/orchestrator';

  export type AudienceSegment =
    | 'fintech' | 'ecommerce' | 'women' | 'ai_ml'
    | 'sme' | 'young' | 'agritech';

  export interface PersonalizedPath {
    segment: AudienceSegment;
    arName: string;
    painPoints: string[];
    priorityDepartments: DepartmentId[];
    emphasis: string[];
  }

  export const PATHS: Record<AudienceSegment, PersonalizedPath> = {
    fintech: {
      segment: 'fintech', arName: 'التكنولوجيا المالية',
      painPoints: ['التعقيدات التنظيمية', 'مخاطر الأمن السيبراني'],
      priorityDepartments: ['finance', 'legal', 'monitoring'],
      emphasis: ['الامتثال للبنك المركزي', 'النمذجة المالية التنبؤية', 'التشفير وحماية البيانات'],
    },
    ecommerce: {
      segment: 'ecommerce', arName: 'التجارة الإلكترونية',
      painPoints: ['التعقيدات اللوجستية', 'منافسة شرسة'],
      priorityDepartments: ['marketing', 'product'],
      emphasis: ['أتمتة التسويق', 'تحسين المخزون', 'سلاسل الإمداد'],
    },
    women: {
      segment: 'women', arName: 'رائدات الأعمال',
      painPoints: ['صعوبة الوصول إلى رأس المال', 'التحيز الجندري'],
      priorityDepartments: ['finance', 'sales'],
      emphasis: ['محاكاة عرض المستثمرين', 'مطابقة صناديق داعمة للنساء'],
    },
    ai_ml: {
      segment: 'ai_ml', arName: 'الذكاء الاصطناعي',
      painPoints: ['نقص المواهب', 'ارتفاع تكلفة الحوسبة'],
      priorityDepartments: ['product', 'monitoring'],
      emphasis: ['مصنع MVP', 'تحسين التكلفة بطبقات النماذج'],
    },
    sme: {
      segment: 'sme', arName: 'المشاريع الصغيرة والمتوسطة',
      painPoints: ['نقص الخبرة الرقمية', 'صعوبة التمويل'],
      priorityDepartments: ['marketing', 'sales'],
      emphasis: ['أدوات مبسطة', 'أتمتة المهام التسويقية', 'إدارة العملاء'],
    },
    young: {
      segment: 'young', arName: 'رواد الأعمال الشباب والطلاب',
      painPoints: ['نقص الخبرة', 'الخوف من الفشل'],
      priorityDepartments: ['product', 'finance'],
      emphasis: ['وضع المرشد الشخصي', 'توجيه خطوة بخطوة', 'منح حكومية'],
    },
    agritech: {
      segment: 'agritech', arName: 'التكنولوجيا الزراعية',
      painPoints: ['محدودية التمويل', 'صعوبة الوصول للمزارعين', 'ملوحة التربة'],
      priorityDepartments: ['product', 'finance'],
      emphasis: ['تحليل سلسلة القيمة', 'البحث عن شراكات'],
    },
  };

  export function getPersonalizedPath(segment: AudienceSegment): PersonalizedPath | null {
    return PATHS[segment] || null;
  }

  export function listSegments(): PersonalizedPath[] {
    return Object.values(PATHS);
  }
  
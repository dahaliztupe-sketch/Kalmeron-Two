/**
 * Company Builder — Types
 * ─────────────────────────────────────────────────────────────────────────────
 * يُعرِّف هيكل بيانات الشركات المخصصة في منصة كلميرون.
 * الرؤية: كل مستخدم يبني شركته الخاصة بموظفين AI جاهزين —
 * مطعم، مصنع، عيادة، شركة تقنية، متجر إلكتروني… أي نوع.
 */

// ─── أنواع الشركات ──────────────────────────────────────────────────────────

export type CompanyType =
  | 'tech_startup'          // شركة تقنية ناشئة
  | 'ecommerce'             // تجارة إلكترونية
  | 'retail'                // متجر / تجزئة
  | 'restaurant_food'       // مطعم / غذاء
  | 'manufacturing'         // تصنيع / مصنع
  | 'consulting'            // استشارات
  | 'healthcare'            // رعاية صحية / عيادة
  | 'education'             // تعليم / مدرسة
  | 'real_estate'           // عقارات
  | 'logistics'             // لوجستيات / توصيل
  | 'finance_investment'    // مالية / استثمار
  | 'marketing_agency'      // وكالة تسويق
  | 'legal_firm'            // مكتب محاماة
  | 'hospitality'           // ضيافة / فندقة
  | 'ngo_nonprofit'         // منظمة غير ربحية
  | 'media_content'         // إعلام / محتوى
  | 'agriculture'           // زراعة
  | 'construction'          // إنشاء / مقاولات
  | 'custom';               // مخصص بالكامل

// ─── حالة الشركة ────────────────────────────────────────────────────────────

export type CompanyStage =
  | 'idea'        // فكرة
  | 'mvp'         // منتج أولي
  | 'early'       // مرحلة مبكرة
  | 'growth'      // نمو
  | 'scale'       // توسع
  | 'mature';     // نضج

// ─── حالة الموظف (الوكيل) ────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'busy' | 'on_task' | 'offline';

// ─── الموظف الافتراضي (وكيل AI) ──────────────────────────────────────────────

export interface VirtualEmployee {
  /** معرّف فريد للموظف في هذه الشركة. */
  id: string;
  /** معرّف الوكيل في سجل الوكلاء (مثال: cfo-agent، brand-builder). */
  agentId: string;
  /** الاسم المعروض. */
  name: string;
  /** الاسم بالعربية. */
  nameAr: string;
  /** المسمى الوظيفي. */
  title: string;
  /** المسمى الوظيفي بالعربية. */
  titleAr: string;
  /** القسم التابع له. */
  departmentId: string;
  /** المدير المباشر (agentId). */
  reportsTo: string | null;
  /** مهاراته الرئيسية. */
  skills: string[];
  /** حالته الحالية. */
  status: EmployeeStatus;
  /** المهمة الحالية (إن وُجدت). */
  currentTaskId?: string;
  /** تاريخ الانضمام. */
  joinedAt: Date;
}

// ─── القسم ───────────────────────────────────────────────────────────────────

export interface CompanyDepartment {
  /** معرّف القسم. */
  id: string;
  /** اسم القسم. */
  name: string;
  /** الاسم بالعربية. */
  nameAr: string;
  /** الوصف. */
  description: string;
  /** رمز القسم (emoji). */
  icon: string;
  /** المدير التنفيذي (agentId). */
  headId: string;
  /** قائمة معرّفات الموظفين في هذا القسم. */
  employeeIds: string[];
  /** القدرات الرئيسية للقسم. */
  capabilities: string[];
  /** اللون (hex). */
  color: string;
}

// ─── المهمة ───────────────────────────────────────────────────────────────────

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'awaiting_review'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CompanyTask {
  /** معرّف المهمة. */
  id: string;
  /** معرّف الشركة. */
  companyId: string;
  /** عنوان المهمة. */
  title: string;
  /** وصف تفصيلي. */
  description: string;
  /** الأقسام المعنية (مهمة متعددة الأقسام). */
  involvedDepartments: string[];
  /** الموظف/الوكيل المعيَّن للتنفيذ. */
  assignedTo: string | null;
  /** الموظف/الوكيل المُفوِّض. */
  delegatedBy: string | null;
  /** الحالة. */
  status: TaskStatus;
  /** الأولوية. */
  priority: TaskPriority;
  /** تاريخ الإنشاء. */
  createdAt: Date;
  /** تاريخ التحديث. */
  updatedAt: Date;
  /** تاريخ الاستحقاق. */
  dueDate?: Date;
  /** نتيجة التنفيذ. */
  output?: string;
  /** معرّف trace التفويض. */
  traceId?: string;
  /** سلسلة التفويض. */
  delegationChain?: Array<{ from: string; to: string; reasoning: string }>;
  /** هل تتطلب مراجعة بشرية؟ */
  requiresHumanReview: boolean;
  /** ملاحظات المراجعة. */
  reviewNotes?: string;
}

// ─── الشركة ───────────────────────────────────────────────────────────────────

export interface Company {
  /** معرّف فريد. */
  id: string;
  /** معرّف المالك. */
  ownerUid: string;
  /** اسم الشركة. */
  name: string;
  /** الاسم بالعربية. */
  nameAr?: string;
  /** الوصف. */
  description: string;
  /** نوع الشركة. */
  type: CompanyType;
  /** نوع الشركة بالعربية. */
  typeNameAr: string;
  /** مرحلة نمو الشركة. */
  stage: CompanyStage;
  /** القطاع / المجال. */
  industry: string;
  /** البلد. */
  country: string;
  /** العملة الرئيسية. */
  currency: 'EGP' | 'USD' | 'SAR' | 'AED';
  /** الأقسام. */
  departments: CompanyDepartment[];
  /** الموظفون الافتراضيون (AI agents). */
  employees: VirtualEmployee[];
  /** الشعار (emoji أو URL). */
  logo: string;
  /** لون العلامة التجارية (hex). */
  brandColor: string;
  /** قيم الشركة. */
  values: string[];
  /** OKRs الحالية. */
  currentOkrs?: string[];
  /** إجمالي المهام المكتملة. */
  tasksCompleted: number;
  /** تاريخ الإنشاء. */
  createdAt: Date;
  /** تاريخ آخر نشاط. */
  lastActiveAt: Date;
  /** هل الشركة نشطة؟ */
  isActive: boolean;
}

// ─── طلب إنشاء الشركة ─────────────────────────────────────────────────────────

export interface CreateCompanyRequest {
  name: string;
  description: string;
  type: CompanyType;
  stage?: CompanyStage;
  industry?: string;
  country?: string;
  currency?: Company['currency'];
  logo?: string;
  brandColor?: string;
  /** preset لتحميل هيكل جاهز مسبقاً. */
  usePreset?: CompanyType;
  /** أقسام مخصصة (تتجاوز الـ preset). */
  customDepartments?: Partial<CompanyDepartment>[];
}

// ─── نتيجة المهمة متعددة الأقسام ──────────────────────────────────────────────

export interface CrossDeptTaskResult {
  taskId: string;
  companyId: string;
  title: string;
  results: Array<{
    departmentId: string;
    departmentNameAr: string;
    agentId: string;
    output: string;
    latencyMs: number;
    status: 'completed' | 'failed';
  }>;
  synthesizedOutput: string;
  totalLatencyMs: number;
  traceId: string;
}

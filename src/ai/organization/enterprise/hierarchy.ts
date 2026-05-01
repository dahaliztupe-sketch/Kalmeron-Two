/**
 * Kalmeron Enterprise Hierarchy
 * هيكل الشركة المؤسسي — نمط الشركات الكبرى
 *
 * مستوحى من: McKinsey، Amazon، Google، Aramco
 * المستويات: C-Suite → Departments → Teams → Workers
 */

export type ExecutiveRole =
  | 'CEO'   // Chief Executive Officer — المدير التنفيذي
  | 'CFO'   // Chief Financial Officer — المدير المالي
  | 'COO'   // Chief Operating Officer — مدير العمليات
  | 'CMO'   // Chief Marketing Officer — مدير التسويق
  | 'CTO'   // Chief Technology Officer — مدير التقنية
  | 'CLO'   // Chief Legal Officer — المستشار القانوني الأول
  | 'CHRO'  // Chief Human Resources Officer — مدير الموارد البشرية
  | 'CSO';  // Chief Strategy Officer — مدير الاستراتيجية

export type DepartmentId =
  | 'finance'
  | 'operations'
  | 'marketing'
  | 'technology'
  | 'legal'
  | 'hr'
  | 'strategy'
  | 'sales'
  | 'support'
  | 'monitoring';

export interface ExecutiveProfile {
  role: ExecutiveRole;
  agentId: string;
  nameAr: string;
  titleAr: string;
  department: DepartmentId;
  directReports: string[];
  mandate: string;
  kpis: string[];
  escalatesTo: ExecutiveRole | null;
}

export interface DepartmentProfile {
  id: DepartmentId;
  nameAr: string;
  head: ExecutiveRole;
  agents: string[];
  capabilities: string[];
}

export const ENTERPRISE_EXECUTIVES: Record<ExecutiveRole, ExecutiveProfile> = {
  CEO: {
    role: 'CEO',
    agentId: 'ceo-agent',
    nameAr: 'المدير التنفيذي',
    titleAr: 'الرئيس التنفيذي',
    department: 'strategy',
    directReports: ['CFO', 'COO', 'CMO', 'CTO', 'CLO', 'CHRO', 'CSO'],
    mandate: 'القيادة الاستراتيجية الشاملة وصنع القرار على مستوى الشركة',
    kpis: ['نمو الإيرادات', 'رضا العملاء', 'حصة السوق', 'الربحية'],
    escalatesTo: null,
  },
  CFO: {
    role: 'CFO',
    agentId: 'cfo-agent',
    nameAr: 'المدير المالي',
    titleAr: 'الرئيس المالي',
    department: 'finance',
    directReports: [
      'budget-analyst',
      'cash-runway',
      'financial-modeling',
      'equity-manager',
      'valuation-expert',
      'investment-advisor',
    ],
    mandate: 'إدارة الصحة المالية والتدفق النقدي والاستثمارات وتقارير المساهمين',
    kpis: ['هامش الربح', 'التدفق النقدي', 'معدل الحرق', 'العائد على الاستثمار'],
    escalatesTo: 'CEO',
  },
  COO: {
    role: 'COO',
    agentId: 'coo-agent',
    nameAr: 'مدير العمليات',
    titleAr: 'الرئيس التنفيذي للعمليات',
    department: 'operations',
    directReports: [
      'operations-manager',
      'mistake-shield',
      'okr',
      'csat-analyst',
      'knowledge-builder',
      'ticket-manager',
    ],
    mandate: 'تحسين الكفاءة التشغيلية وضمان تنفيذ الاستراتيجية على أرض الواقع',
    kpis: ['كفاءة العمليات', 'جودة التسليم', 'معدل الأخطاء', 'رضا الفريق'],
    escalatesTo: 'CEO',
  },
  CMO: {
    role: 'CMO',
    agentId: 'cmo-agent',
    nameAr: 'مدير التسويق',
    titleAr: 'الرئيس التنفيذي للتسويق',
    department: 'marketing',
    directReports: [
      'marketing-strategist',
      'brand-builder',
      'competitor-intel',
      'market-researcher',
      'content-creator',
      'seo-manager',
      'ads-manager',
      'acquisition-strategist',
      'lead-qualifier',
      'sales-pipeline',
      'pitch-deck',
      'sales-strategist',
    ],
    mandate: 'بناء العلامة التجارية وتحقيق النمو واستحواذ العملاء في الأسواق المستهدفة',
    kpis: ['تكلفة الاستحواذ', 'معدل التحويل', 'الوعي بالعلامة', 'قيمة العميل مدى الحياة'],
    escalatesTo: 'CEO',
  },
  CTO: {
    role: 'CTO',
    agentId: 'cto-agent',
    nameAr: 'مدير التقنية',
    titleAr: 'الرئيس التنفيذي للتقنية',
    department: 'technology',
    directReports: [
      'code-interpreter',
      'digital-twin',
      'product-manager',
      'devops-engineer',
      'qa-manager',
    ],
    mandate: 'قيادة التحول الرقمي واعتماد التقنيات الناشئة وبناء البنية التحتية التقنية',
    kpis: ['وقت التشغيل', 'سرعة التطوير', 'الدين التقني', 'الابتكار التقني'],
    escalatesTo: 'CEO',
  },
  CLO: {
    role: 'CLO',
    agentId: 'clo-agent',
    nameAr: 'المستشار القانوني',
    titleAr: 'الرئيس التنفيذي للشؤون القانونية',
    department: 'legal',
    directReports: [
      'legal-guide',
      'compliance',
      'contract-drafter',
      'ip-protector',
      'data-privacy',
    ],
    mandate: 'حماية الشركة قانونياً وضمان الامتثال للوائح المصرية والدولية',
    kpis: ['المخاطر القانونية', 'الامتثال التنظيمي', 'حل النزاعات', 'الحماية الفكرية'],
    escalatesTo: 'CEO',
  },
  CHRO: {
    role: 'CHRO',
    agentId: 'chro-agent',
    nameAr: 'مدير الموارد البشرية',
    titleAr: 'الرئيس التنفيذي للموارد البشرية',
    department: 'hr',
    directReports: [
      'hiring-advisor',
      'sales-coach',
      'culture-expert',
      'performance-manager',
      'org-designer',
    ],
    mandate: 'استقطاب وتطوير والاحتفاظ بالكفاءات وبناء ثقافة مؤسسية قوية',
    kpis: ['معدل الاحتفاظ', 'رضا الموظفين', 'سرعة التوظيف', 'إنتاجية الفريق'],
    escalatesTo: 'CEO',
  },
  CSO: {
    role: 'CSO',
    agentId: 'cso-agent',
    nameAr: 'مدير الاستراتيجية',
    titleAr: 'الرئيس التنفيذي للاستراتيجية',
    department: 'strategy',
    directReports: [
      'idea-validator',
      'opportunity-radar',
      'expansion-planner',
      'board-advisor',
      'investment-advisor',
      'pitch-deck',
      'valuation-expert',
    ],
    mandate: 'رسم الرؤية الاستراتيجية بعيدة المدى والتوسع وتحديد الفرص الجديدة',
    kpis: ['التوسع الجغرافي', 'خط الفرص', 'التوافق الاستراتيجي', 'نمو المحفظة'],
    escalatesTo: 'CEO',
  },
};

export const ENTERPRISE_DEPARTMENTS: Record<DepartmentId, DepartmentProfile> = {
  finance: {
    id: 'finance',
    nameAr: 'الإدارة المالية',
    head: 'CFO',
    agents: [
      'cfo-agent',
      'budget-analyst',
      'cash-runway',
      'financial-modeling',
      'equity-manager',
      'valuation-expert',
      'investment-advisor',
    ],
    capabilities: ['financial-analysis', 'forecasting', 'investment', 'cash-flow', 'tax', 'valuation', 'equity'],
  },
  operations: {
    id: 'operations',
    nameAr: 'إدارة العمليات',
    head: 'COO',
    agents: ['coo-agent', 'operations-manager', 'mistake-shield', 'okr'],
    capabilities: ['process-optimization', 'risk-management', 'okr', 'quality'],
  },
  marketing: {
    id: 'marketing',
    nameAr: 'إدارة التسويق',
    head: 'CMO',
    agents: [
      'cmo-agent',
      'marketing-strategist',
      'brand-builder',
      'competitor-intel',
      'market-researcher',
      'content-creator',
      'seo-manager',
      'ads-manager',
      'acquisition-strategist',
    ],
    capabilities: ['brand', 'growth', 'market-research', 'competitor-analysis', 'campaigns', 'seo', 'content', 'paid-ads'],
  },
  technology: {
    id: 'technology',
    nameAr: 'إدارة التقنية',
    head: 'CTO',
    agents: [
      'cto-agent',
      'code-interpreter',
      'digital-twin',
      'product-manager',
      'devops-engineer',
      'qa-manager',
    ],
    capabilities: ['software', 'architecture', 'digital-transformation', 'ai-implementation', 'devops', 'quality-assurance'],
  },
  legal: {
    id: 'legal',
    nameAr: 'الإدارة القانونية',
    head: 'CLO',
    agents: [
      'clo-agent',
      'legal-guide',
      'compliance',
      'contract-drafter',
      'ip-protector',
      'data-privacy',
    ],
    capabilities: ['contracts', 'compliance', 'ip', 'regulatory', 'dispute-resolution', 'data-privacy'],
  },
  hr: {
    id: 'hr',
    nameAr: 'إدارة الموارد البشرية',
    head: 'CHRO',
    agents: [
      'chro-agent',
      'hiring-advisor',
      'sales-coach',
      'culture-expert',
      'performance-manager',
      'org-designer',
    ],
    capabilities: ['recruitment', 'training', 'performance', 'culture', 'compensation', 'org-design'],
  },
  strategy: {
    id: 'strategy',
    nameAr: 'الإدارة الاستراتيجية',
    head: 'CSO',
    agents: [
      'cso-agent',
      'idea-validator',
      'opportunity-radar',
      'expansion-planner',
      'board-advisor',
      'investment-advisor',
      'pitch-deck',
      'valuation-expert',
    ],
    capabilities: ['strategic-planning', 'opportunity-identification', 'expansion', 'investor-relations', 'valuation'],
  },
  sales: {
    id: 'sales',
    nameAr: 'إدارة المبيعات',
    head: 'CMO',
    agents: [
      'sales-coach',
      'lead-qualifier',
      'sales-pipeline',
      'pitch-deck',
      'sales-strategist',
    ],
    capabilities: ['sales-strategy', 'pipeline', 'customer-acquisition', 'crm', 'lead-qualification'],
  },
  support: {
    id: 'support',
    nameAr: 'خدمة العملاء',
    head: 'COO',
    agents: [
      'customer-support',
      'csat-analyst',
      'knowledge-builder',
      'ticket-manager',
    ],
    capabilities: ['customer-service', 'issue-resolution', 'feedback', 'csat', 'knowledge-base'],
  },
  monitoring: {
    id: 'monitoring',
    nameAr: 'المراقبة والأمان',
    head: 'CTO',
    agents: [],
    capabilities: ['security', 'observability', 'alerts'],
  },
};

export function getExecutiveForDepartment(dept: DepartmentId): ExecutiveProfile {
  const profile = ENTERPRISE_DEPARTMENTS[dept];
  return ENTERPRISE_EXECUTIVES[profile.head];
}

export function getDepartmentsForExecutive(role: ExecutiveRole): DepartmentProfile[] {
  return Object.values(ENTERPRISE_DEPARTMENTS).filter(d => d.head === role);
}

export function getReportingChain(agentId: string): ExecutiveRole[] {
  for (const [role, exec] of Object.entries(ENTERPRISE_EXECUTIVES)) {
    if (exec.directReports.includes(agentId) || exec.agentId === agentId) {
      const chain: ExecutiveRole[] = [role as ExecutiveRole];
      if (exec.escalatesTo) chain.push(exec.escalatesTo);
      return chain;
    }
  }
  return ['CEO'];
}

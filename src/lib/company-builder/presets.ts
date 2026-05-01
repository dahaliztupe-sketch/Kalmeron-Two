/**
 * Company Builder — Presets
 * ─────────────────────────────────────────────────────────────────────────────
 * هياكل تنظيمية جاهزة لكل نوع شركة.
 * كل preset يحتوي على: الأقسام + الموظفين الافتراضيين (AI agents) + الإعدادات الأساسية.
 *
 * المبدأ: أي نوع شركة ممكن — مطعم، عيادة، متجر، مصنع، وكالة، جامعة، منظمة خيرية…
 */

import type { CompanyType, CompanyDepartment, VirtualEmployee } from './types';

export interface CompanyPreset {
  type: CompanyType;
  nameAr: string;
  description: string;
  icon: string;
  defaultCurrency: 'EGP' | 'USD' | 'SAR' | 'AED';
  departments: Array<Omit<CompanyDepartment, 'employeeIds'> & { employeeIds: string[] }>;
  employees: Omit<VirtualEmployee, 'joinedAt' | 'status' | 'currentTaskId'>[];
  suggestedValues: string[];
  suggestedOkrs: string[];
  color: string;
}

// ─── مساعدات بناء الموظف ──────────────────────────────────────────────────────

function emp(
  id: string,
  agentId: string,
  nameAr: string,
  titleAr: string,
  title: string,
  departmentId: string,
  reportsTo: string | null,
  skills: string[],
): Omit<VirtualEmployee, 'joinedAt' | 'status' | 'currentTaskId'> {
  return {
    id,
    agentId,
    name: agentId,
    nameAr,
    title,
    titleAr,
    departmentId,
    reportsTo,
    skills,
  };
}

function dept(
  id: string,
  nameAr: string,
  name: string,
  description: string,
  icon: string,
  headId: string,
  employeeIds: string[],
  capabilities: string[],
  color: string,
): CompanyPreset['departments'][0] {
  return { id, name, nameAr, description, icon, headId, employeeIds, capabilities, color };
}

// ─── PRESET: شركة تقنية ناشئة ─────────────────────────────────────────────────

export const TECH_STARTUP_PRESET: CompanyPreset = {
  type: 'tech_startup',
  nameAr: 'شركة تقنية ناشئة',
  description: 'هيكل مثالي للشركات التقنية الناشئة — منتج رقمي، تطوير سريع، نمو مدفوع بالبيانات',
  icon: '🚀',
  defaultCurrency: 'EGP',
  color: '#6366f1',
  departments: [
    dept('exec', 'الإدارة التنفيذية', 'Executive', 'القيادة والتوجيه الاستراتيجي', '👑', 'ceo', ['ceo', 'cso'], ['strategy', 'vision', 'fundraising'], '#6366f1'),
    dept('product', 'المنتج والتقنية', 'Product & Tech', 'تطوير المنتج والبنية التحتية', '💻', 'cto', ['cto', 'product-mgr', 'devops'], ['product', 'engineering', 'qa'], '#3b82f6'),
    dept('growth', 'النمو والتسويق', 'Growth & Marketing', 'استحواذ العملاء والعلامة التجارية', '📈', 'cmo', ['cmo', 'content', 'ads'], ['marketing', 'growth', 'brand'], '#10b981'),
    dept('finance', 'المالية', 'Finance', 'إدارة التدفق النقدي والاستثمار', '💰', 'cfo', ['cfo', 'budget'], ['finance', 'runway', 'fundraising'], '#f59e0b'),
    dept('legal', 'القانون والامتثال', 'Legal', 'الحماية القانونية والعقود', '⚖️', 'clo', ['clo', 'contract'], ['legal', 'compliance', 'ip'], '#8b5cf6'),
  ],
  employees: [
    emp('ceo', 'ceo', 'المدير التنفيذي', 'CEO', 'CEO', 'exec', null, ['strategy', 'vision', 'leadership']),
    emp('cso', 'cso-agent', 'مدير الاستراتيجية', 'CSO', 'CSO', 'exec', 'ceo', ['strategy', 'expansion']),
    emp('cto', 'cto-agent', 'مدير التقنية', 'CTO', 'CTO', 'product', 'ceo', ['tech', 'architecture', 'ai']),
    emp('product-mgr', 'product-manager', 'مدير المنتج', 'مدير المنتج', 'Product Manager', 'product', 'cto', ['product', 'roadmap', 'user-stories']),
    emp('devops', 'devops-engineer', 'مهندس DevOps', 'مهندس DevOps', 'DevOps Engineer', 'product', 'cto', ['devops', 'infrastructure', 'ci-cd']),
    emp('cmo', 'cmo-agent', 'مدير التسويق', 'CMO', 'CMO', 'growth', 'ceo', ['marketing', 'brand', 'growth']),
    emp('content', 'content-creator', 'صانع المحتوى', 'صانع المحتوى', 'Content Creator', 'growth', 'cmo', ['content', 'seo', 'social']),
    emp('ads', 'ads-manager', 'مدير الإعلانات', 'مدير الإعلانات', 'Ads Manager', 'growth', 'cmo', ['paid-ads', 'ppc', 'analytics']),
    emp('cfo', 'cfo-agent', 'المدير المالي', 'CFO', 'CFO', 'finance', 'ceo', ['finance', 'cash-flow', 'fundraising']),
    emp('budget', 'budget-analyst', 'محلل الميزانية', 'محلل مالي', 'Financial Analyst', 'finance', 'cfo', ['budgeting', 'forecasting']),
    emp('clo', 'clo-agent', 'المستشار القانوني', 'CLO', 'CLO', 'legal', 'ceo', ['legal', 'contracts', 'ip']),
    emp('contract', 'contract-drafter', 'محرر العقود', 'محرر العقود', 'Contract Drafter', 'legal', 'clo', ['contracts', 'terms', 'nda']),
  ],
  suggestedValues: ['الابتكار المستمر', 'الشفافية', 'التمحور حول المستخدم', 'السرعة والجودة'],
  suggestedOkrs: ['زيادة المستخدمين الفاعلين بنسبة 50%', 'إطلاق 3 ميزات جديدة كبرى', 'تقليل معدل الإلغاء إلى أقل من 5%'],
};

// ─── PRESET: مطعم / غذاء ─────────────────────────────────────────────────────

export const RESTAURANT_PRESET: CompanyPreset = {
  type: 'restaurant_food',
  nameAr: 'مطعم / عمل غذائي',
  description: 'هيكل متكامل للمطاعم وأعمال الغذاء — عمليات، مطبخ، خدمة عملاء، تسويق',
  icon: '🍽️',
  defaultCurrency: 'EGP',
  color: '#f97316',
  departments: [
    dept('mgmt', 'الإدارة', 'Management', 'الإدارة العامة والقرارات الاستراتيجية', '👑', 'gm', ['gm', 'strategy'], ['strategy', 'operations', 'financials'], '#6366f1'),
    dept('ops', 'العمليات والمطبخ', 'Operations', 'إدارة المطبخ وسلسلة التوريد', '👨‍🍳', 'ops-mgr', ['ops-mgr', 'supply'], ['operations', 'quality', 'supply-chain'], '#f97316'),
    dept('service', 'خدمة العملاء', 'Customer Service', 'تجربة الزبائن والشكاوى والتقييمات', '⭐', 'csat', ['csat', 'support'], ['customer-service', 'csat', 'loyalty'], '#10b981'),
    dept('marketing', 'التسويق', 'Marketing', 'العلامة التجارية والحملات والتواصل الاجتماعي', '📱', 'marketer', ['marketer', 'content'], ['marketing', 'social-media', 'promotions'], '#ec4899'),
    dept('finance', 'المالية', 'Finance', 'إدارة التكاليف والإيرادات', '💰', 'accountant', ['accountant'], ['finance', 'cost-control', 'payroll'], '#f59e0b'),
  ],
  employees: [
    emp('gm', 'ceo', 'المدير العام', 'المدير العام', 'General Manager', 'mgmt', null, ['strategy', 'leadership', 'operations']),
    emp('strategy', 'cso-agent', 'مستشار الاستراتيجية', 'مستشار', 'Strategy Advisor', 'mgmt', 'gm', ['strategy', 'expansion']),
    emp('ops-mgr', 'operations-manager', 'مدير العمليات', 'مدير العمليات', 'Operations Manager', 'ops', 'gm', ['operations', 'quality', 'processes']),
    emp('supply', 'budget-analyst', 'مدير المشتريات', 'مدير المشتريات', 'Procurement Manager', 'ops', 'ops-mgr', ['supply-chain', 'cost-control', 'vendors']),
    emp('csat', 'csat-analyst', 'محلل تجربة العملاء', 'محلل CSAT', 'CSAT Analyst', 'service', 'gm', ['csat', 'feedback', 'loyalty']),
    emp('support', 'customer-support', 'خدمة العملاء', 'موظف خدمة العملاء', 'Customer Support', 'service', 'csat', ['support', 'complaints', 'resolutions']),
    emp('marketer', 'marketing-strategist', 'مسؤول التسويق', 'مسؤول التسويق', 'Marketing Manager', 'marketing', 'gm', ['marketing', 'campaigns', 'analytics']),
    emp('content', 'content-creator', 'صانع المحتوى', 'صانع المحتوى', 'Content Creator', 'marketing', 'marketer', ['content', 'social-media', 'photography']),
    emp('accountant', 'cfo-agent', 'المحاسب', 'المحاسب', 'Accountant', 'finance', 'gm', ['accounting', 'cost-control', 'payroll']),
  ],
  suggestedValues: ['الجودة فوق كل شيء', 'سعادة الزبون', 'النظافة والأمان', 'الابتكار في الطعام'],
  suggestedOkrs: ['الوصول لتقييم 4.8 نجوم', 'زيادة المبيعات 30%', 'تقليل الهدر الغذائي 20%'],
};

// ─── PRESET: وكالة تسويق ─────────────────────────────────────────────────────

export const MARKETING_AGENCY_PRESET: CompanyPreset = {
  type: 'marketing_agency',
  nameAr: 'وكالة تسويق وإبداع',
  description: 'هيكل وكالة تسويق رقمي متكامل — استراتيجية، إبداع، إدارة حسابات، بيانات',
  icon: '🎯',
  defaultCurrency: 'EGP',
  color: '#ec4899',
  departments: [
    dept('strategy', 'الاستراتيجية', 'Strategy', 'تخطيط الحملات واستراتيجية العلامات', '🧭', 'strat', ['strat', 'researcher'], ['strategy', 'planning', 'analytics'], '#6366f1'),
    dept('creative', 'الإبداع والمحتوى', 'Creative', 'إنتاج المحتوى والتصميم والإعلانات', '🎨', 'creative-dir', ['creative-dir', 'content', 'designer'], ['content', 'design', 'video'], '#ec4899'),
    dept('performance', 'الأداء والإعلانات', 'Performance', 'إدارة الحملات المدفوعة وتحسين الأداء', '📊', 'perf-mgr', ['perf-mgr', 'ads'], ['paid-ads', 'seo', 'analytics'], '#3b82f6'),
    dept('accounts', 'إدارة الحسابات', 'Account Management', 'العلاقة مع العملاء والمتابعة', '🤝', 'acct-mgr', ['acct-mgr', 'support'], ['client-relations', 'reporting', 'upsell'], '#10b981'),
    dept('finance', 'المالية والإدارة', 'Finance', 'إدارة الفواتير والتكاليف', '💼', 'fin-dir', ['fin-dir'], ['billing', 'cost-management', 'forecasting'], '#f59e0b'),
  ],
  employees: [
    emp('strat', 'cso-agent', 'مدير الاستراتيجية', 'مدير الاستراتيجية', 'Strategy Director', 'strategy', null, ['strategy', 'brand', 'market-research']),
    emp('researcher', 'market-researcher', 'باحث السوق', 'باحث السوق', 'Market Researcher', 'strategy', 'strat', ['research', 'insights', 'competitor-analysis']),
    emp('creative-dir', 'brand-builder', 'المدير الإبداعي', 'المدير الإبداعي', 'Creative Director', 'creative', null, ['brand', 'design', 'creative']),
    emp('content', 'content-creator', 'صانع المحتوى', 'صانع المحتوى', 'Content Creator', 'creative', 'creative-dir', ['content', 'copywriting', 'social']),
    emp('designer', 'brand-builder', 'المصمم الجرافيكي', 'المصمم', 'Graphic Designer', 'creative', 'creative-dir', ['design', 'visual-identity']),
    emp('perf-mgr', 'marketing-strategist', 'مدير الأداء', 'مدير الأداء', 'Performance Manager', 'performance', null, ['paid-ads', 'analytics', 'conversion']),
    emp('ads', 'ads-manager', 'مدير الإعلانات', 'مدير الإعلانات', 'Ads Manager', 'performance', 'perf-mgr', ['google-ads', 'meta-ads', 'tiktok']),
    emp('acct-mgr', 'sales-strategist', 'مدير الحسابات', 'مدير الحسابات', 'Account Manager', 'accounts', null, ['client-relations', 'presentations', 'reporting']),
    emp('support', 'customer-support', 'دعم العملاء', 'دعم العملاء', 'Client Support', 'accounts', 'acct-mgr', ['support', 'follow-up']),
    emp('fin-dir', 'cfo-agent', 'المدير المالي', 'المدير المالي', 'Finance Director', 'finance', null, ['billing', 'forecasting', 'cost-management']),
  ],
  suggestedValues: ['الإبداع بلا حدود', 'النتائج تتكلم', 'شراكة حقيقية مع العملاء'],
  suggestedOkrs: ['زيادة محفظة العملاء 40%', 'تحقيق ROAS 4x للعملاء', 'توسيع الفريق إلى 15 عضو'],
};

// ─── PRESET: عيادة / رعاية صحية ──────────────────────────────────────────────

export const HEALTHCARE_PRESET: CompanyPreset = {
  type: 'healthcare',
  nameAr: 'عيادة / مركز صحي',
  description: 'هيكل متكامل للعيادات والمراكز الصحية — طبي، إداري، مالي، خدمة مرضى',
  icon: '🏥',
  defaultCurrency: 'EGP',
  color: '#10b981',
  departments: [
    dept('medical', 'القسم الطبي', 'Medical', 'الرعاية الطبية والعلاج', '⚕️', 'med-dir', ['med-dir', 'quality'], ['medical-care', 'protocols', 'quality'], '#10b981'),
    dept('admin', 'الإدارة والاستقبال', 'Administration', 'تسجيل المرضى والمواعيد والإدارة', '📋', 'admin-mgr', ['admin-mgr', 'scheduler'], ['administration', 'scheduling', 'records'], '#6366f1'),
    dept('patient-svc', 'خدمة المرضى', 'Patient Services', 'تجربة المريض والمتابعة', '💙', 'patient-coord', ['patient-coord', 'feedback'], ['patient-experience', 'follow-up', 'satisfaction'], '#3b82f6'),
    dept('finance', 'المالية والتأمين', 'Finance', 'الفواتير والتأمين والتدفق النقدي', '💰', 'fin-mgr', ['fin-mgr'], ['billing', 'insurance', 'payroll'], '#f59e0b'),
    dept('compliance', 'الامتثال والجودة', 'Compliance', 'اللوائح الصحية والجودة', '✅', 'compliance-off', ['compliance-off'], ['compliance', 'quality', 'safety'], '#8b5cf6'),
  ],
  employees: [
    emp('med-dir', 'coo-agent', 'المدير الطبي', 'المدير الطبي', 'Medical Director', 'medical', null, ['medical-management', 'protocols', 'quality']),
    emp('quality', 'qa-manager', 'مدير الجودة', 'مدير الجودة', 'Quality Manager', 'medical', 'med-dir', ['quality', 'accreditation', 'safety']),
    emp('admin-mgr', 'operations-manager', 'مدير الإدارة', 'مدير الإدارة', 'Admin Manager', 'admin', null, ['operations', 'scheduling', 'records']),
    emp('scheduler', 'knowledge-builder', 'منسق المواعيد', 'منسق المواعيد', 'Appointment Coordinator', 'admin', 'admin-mgr', ['scheduling', 'coordination']),
    emp('patient-coord', 'csat-analyst', 'منسق المرضى', 'منسق المرضى', 'Patient Coordinator', 'patient-svc', null, ['patient-experience', 'empathy', 'communication']),
    emp('feedback', 'customer-support', 'متابعة المرضى', 'متابعة المرضى', 'Patient Follow-up', 'patient-svc', 'patient-coord', ['follow-up', 'feedback']),
    emp('fin-mgr', 'cfo-agent', 'المدير المالي', 'المدير المالي', 'Finance Manager', 'finance', null, ['billing', 'insurance-claims', 'financial-planning']),
    emp('compliance-off', 'compliance', 'مسؤول الامتثال', 'مسؤول الامتثال', 'Compliance Officer', 'compliance', null, ['healthcare-regulations', 'safety', 'audit']),
  ],
  suggestedValues: ['المريض أولاً', 'الجودة والسلامة', 'الرعاية المتكاملة', 'الابتكار الطبي'],
  suggestedOkrs: ['رفع رضا المرضى إلى 95%', 'تقليل وقت الانتظار 30%', 'الحصول على اعتماد الجودة JCI'],
};

// ─── PRESET: تجارة إلكترونية ─────────────────────────────────────────────────

export const ECOMMERCE_PRESET: CompanyPreset = {
  type: 'ecommerce',
  nameAr: 'متجر إلكتروني',
  description: 'هيكل متجر إلكتروني متكامل — منتجات، لوجستيات، خدمة عملاء، تسويق رقمي',
  icon: '🛒',
  defaultCurrency: 'EGP',
  color: '#f59e0b',
  departments: [
    dept('catalog', 'إدارة المنتجات', 'Catalog', 'إدارة المخزون والمنتجات والتسعير', '📦', 'catalog-mgr', ['catalog-mgr', 'pricing'], ['product-management', 'inventory', 'pricing'], '#f59e0b'),
    dept('logistics', 'اللوجستيات والشحن', 'Logistics', 'الطلبات والشحن والعمليات', '🚚', 'ops-mgr', ['ops-mgr', 'fulfillment'], ['fulfillment', 'shipping', 'returns'], '#6366f1'),
    dept('cx', 'تجربة العملاء', 'Customer Experience', 'الدعم والشكاوى وولاء العملاء', '🌟', 'cx-mgr', ['cx-mgr', 'support'], ['support', 'csat', 'loyalty', 'returns'], '#10b981'),
    dept('growth', 'التسويق والنمو', 'Growth', 'الإعلانات وSEO والتسويق بالعمولة', '📈', 'growth-mgr', ['growth-mgr', 'ads', 'seo', 'affiliate'], ['paid-ads', 'seo', 'email', 'affiliate'], '#ec4899'),
    dept('finance', 'المالية', 'Finance', 'الإيرادات والتكاليف وإدارة الموردين', '💰', 'fin-mgr', ['fin-mgr', 'vendor'], ['revenue', 'costs', 'vendor-management'], '#3b82f6'),
  ],
  employees: [
    emp('catalog-mgr', 'product-manager', 'مدير المنتجات', 'مدير المنتجات', 'Product Manager', 'catalog', null, ['product-catalog', 'pricing', 'inventory']),
    emp('pricing', 'financial-modeling', 'محلل التسعير', 'محلل التسعير', 'Pricing Analyst', 'catalog', 'catalog-mgr', ['pricing', 'competitive-analysis']),
    emp('ops-mgr', 'operations-manager', 'مدير العمليات', 'مدير العمليات', 'Operations Manager', 'logistics', null, ['fulfillment', 'logistics', 'processes']),
    emp('fulfillment', 'ticket-manager', 'مدير الشحن', 'مدير الشحن', 'Fulfillment Manager', 'logistics', 'ops-mgr', ['shipping', 'tracking', 'returns']),
    emp('cx-mgr', 'csat-analyst', 'مدير تجربة العملاء', 'مدير CX', 'CX Manager', 'cx', null, ['csat', 'experience', 'loyalty']),
    emp('support', 'customer-support', 'فريق الدعم', 'فريق الدعم', 'Support Team', 'cx', 'cx-mgr', ['support', 'complaints', 'exchanges']),
    emp('growth-mgr', 'marketing-strategist', 'مدير النمو', 'مدير النمو', 'Growth Manager', 'growth', null, ['growth', 'acquisition', 'retention']),
    emp('ads', 'ads-manager', 'مدير الإعلانات', 'مدير الإعلانات', 'Ads Manager', 'growth', 'growth-mgr', ['paid-ads', 'retargeting', 'roas']),
    emp('seo', 'seo-manager', 'مسؤول SEO', 'مسؤول SEO', 'SEO Manager', 'growth', 'growth-mgr', ['seo', 'content', 'organic']),
    emp('fin-mgr', 'cfo-agent', 'المدير المالي', 'المدير المالي', 'Finance Manager', 'finance', null, ['revenue', 'unit-economics', 'vendor']),
    emp('vendor', 'investment-advisor', 'مدير الموردين', 'مدير الموردين', 'Vendor Manager', 'finance', 'fin-mgr', ['vendor-relations', 'negotiations', 'contracts']),
  ],
  suggestedValues: ['سهولة التسوق', 'الشحن السريع', 'الشفافية مع العملاء', 'الأسعار التنافسية'],
  suggestedOkrs: ['زيادة معدل التحويل إلى 3.5%', 'تقليل معدل العربة المتروكة 20%', 'الوصول لـ 10,000 طلب شهرياً'],
};

// ─── فهرس جميع الـ Presets ──────────────────────────────────────────────────

export const ALL_PRESETS: Record<CompanyType, CompanyPreset | null> = {
  tech_startup: TECH_STARTUP_PRESET,
  restaurant_food: RESTAURANT_PRESET,
  marketing_agency: MARKETING_AGENCY_PRESET,
  healthcare: HEALTHCARE_PRESET,
  ecommerce: ECOMMERCE_PRESET,
  // الباقي يستخدم هيكل tech_startup كقالب افتراضي مع تعديلات
  retail: { ...ECOMMERCE_PRESET, type: 'retail', nameAr: 'متجر / تجزئة', icon: '🏪' },
  consulting: { ...MARKETING_AGENCY_PRESET, type: 'consulting', nameAr: 'شركة استشارات', icon: '💼' },
  real_estate: { ...TECH_STARTUP_PRESET, type: 'real_estate', nameAr: 'شركة عقارات', icon: '🏢' },
  logistics: { ...ECOMMERCE_PRESET, type: 'logistics', nameAr: 'شركة لوجستيات', icon: '🚚' },
  finance_investment: { ...TECH_STARTUP_PRESET, type: 'finance_investment', nameAr: 'شركة مالية / استثمار', icon: '📊' },
  legal_firm: { ...TECH_STARTUP_PRESET, type: 'legal_firm', nameAr: 'مكتب محاماة', icon: '⚖️' },
  hospitality: { ...RESTAURANT_PRESET, type: 'hospitality', nameAr: 'فندق / ضيافة', icon: '🏨' },
  ngo_nonprofit: { ...TECH_STARTUP_PRESET, type: 'ngo_nonprofit', nameAr: 'منظمة غير ربحية', icon: '❤️' },
  media_content: { ...MARKETING_AGENCY_PRESET, type: 'media_content', nameAr: 'شركة إعلام / محتوى', icon: '🎬' },
  agriculture: { ...ECOMMERCE_PRESET, type: 'agriculture', nameAr: 'مشروع زراعي', icon: '🌾' },
  construction: { ...ECOMMERCE_PRESET, type: 'construction', nameAr: 'شركة إنشاء / مقاولات', icon: '🏗️' },
  education: { ...TECH_STARTUP_PRESET, type: 'education', nameAr: 'مؤسسة تعليمية', icon: '📚' },
  manufacturing: { ...ECOMMERCE_PRESET, type: 'manufacturing', nameAr: 'مصنع / تصنيع', icon: '🏭' },
  custom: null,
};

export function getPreset(type: CompanyType): CompanyPreset | null {
  return ALL_PRESETS[type] ?? null;
}

export const COMPANY_TYPE_LIST: Array<{ type: CompanyType; nameAr: string; icon: string; description: string }> = [
  { type: 'tech_startup', nameAr: 'شركة تقنية ناشئة', icon: '🚀', description: 'SaaS، تطبيقات، AI' },
  { type: 'ecommerce', nameAr: 'متجر إلكتروني', icon: '🛒', description: 'بيع منتجات عبر الإنترنت' },
  { type: 'restaurant_food', nameAr: 'مطعم / غذاء', icon: '🍽️', description: 'مطاعم، كافيهات، خدمات الطعام' },
  { type: 'marketing_agency', nameAr: 'وكالة تسويق', icon: '🎯', description: 'تسويق رقمي وإبداعي' },
  { type: 'healthcare', nameAr: 'رعاية صحية', icon: '🏥', description: 'عيادات، مراكز طبية' },
  { type: 'retail', nameAr: 'تجزئة / متجر', icon: '🏪', description: 'متاجر، سوبرماركت' },
  { type: 'consulting', nameAr: 'استشارات', icon: '💼', description: 'خدمات استشارية متخصصة' },
  { type: 'real_estate', nameAr: 'عقارات', icon: '🏢', description: 'بيع وإيجار وتطوير عقاري' },
  { type: 'logistics', nameAr: 'لوجستيات', icon: '🚚', description: 'شحن، توصيل، مستودعات' },
  { type: 'finance_investment', nameAr: 'مالية / استثمار', icon: '📊', description: 'صناديق، تمويل، استثمار' },
  { type: 'education', nameAr: 'تعليم', icon: '📚', description: 'مدارس، مراكز تدريب، منصات' },
  { type: 'manufacturing', nameAr: 'تصنيع', icon: '🏭', description: 'مصانع وإنتاج' },
  { type: 'media_content', nameAr: 'إعلام / محتوى', icon: '🎬', description: 'إنتاج محتوى، إعلام' },
  { type: 'hospitality', nameAr: 'ضيافة / فنادق', icon: '🏨', description: 'فنادق، سياحة، ضيافة' },
  { type: 'legal_firm', nameAr: 'مكتب قانوني', icon: '⚖️', description: 'محاماة، قانون الأعمال' },
  { type: 'ngo_nonprofit', nameAr: 'منظمة غير ربحية', icon: '❤️', description: 'خيرية، مجتمعية، بيئية' },
  { type: 'agriculture', nameAr: 'زراعة', icon: '🌾', description: 'مزارع، إنتاج غذائي' },
  { type: 'construction', nameAr: 'إنشاء / مقاولات', icon: '🏗️', description: 'بناء، مقاولات، تشطيبات' },
  { type: 'custom', nameAr: 'مخصص', icon: '✨', description: 'ابنِ هيكلك من الصفر' },
];

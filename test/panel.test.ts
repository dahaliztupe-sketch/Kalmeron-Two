import { describe, it, expect } from 'vitest';
import {
  PERMANENT_EXPERTS,
  STRATEGIC_EXPERTS,
  TECHNICAL_EXPERTS,
  MARKETING_EXPERTS,
  ALL_EXPERTS,
  CouncilOutputSchema,
  formatCouncilAsMarkdown,
} from '@/src/ai/panel';
import { buildPanelRoster } from '@/src/ai/panel/router';

describe('Panel of Experts — definitions', () => {
  it('defines exactly 4 permanent experts', () => {
    expect(Object.keys(PERMANENT_EXPERTS)).toHaveLength(4);
    expect(PERMANENT_EXPERTS.critical_analyst).toBeDefined();
    expect(PERMANENT_EXPERTS.context_engineer).toBeDefined();
    expect(PERMANENT_EXPERTS.quality_auditor).toBeDefined();
    expect(PERMANENT_EXPERTS.ethical_reviewer).toBeDefined();
  });

  it('defines 12 specialized experts (4 per panel)', () => {
    expect(Object.keys(STRATEGIC_EXPERTS)).toHaveLength(4);
    expect(Object.keys(TECHNICAL_EXPERTS)).toHaveLength(4);
    expect(Object.keys(MARKETING_EXPERTS)).toHaveLength(4);
  });

  it('exposes 16 experts in ALL_EXPERTS', () => {
    expect(Object.keys(ALL_EXPERTS)).toHaveLength(16);
  });

  it('every expert has nameAr, roleAr and systemAr', () => {
    for (const e of Object.values(ALL_EXPERTS)) {
      expect(e.nameAr.length).toBeGreaterThan(2);
      expect(e.roleAr.length).toBeGreaterThan(5);
      expect(e.systemAr.length).toBeGreaterThan(20);
    }
  });
});

describe('Panel of Experts — roster builder', () => {
  it('always includes the 4 permanent experts in the roster', () => {
    const roster = buildPanelRoster(['growth_strategist', 'principal_engineer']);
    expect(roster).toContain('المحلل الناقد');
    expect(roster).toContain('مهندس السياق');
    expect(roster).toContain('مدقق الجودة');
    expect(roster).toContain('المراجع الأخلاقي');
    expect(roster).toContain('استراتيجي النمو');
    expect(roster).toContain('مهندس البرمجيات الرئيسي');
  });

  it('silently ignores unknown expert ids', () => {
    const roster = buildPanelRoster(['__unknown__', 'risk_analyst']);
    expect(roster).toContain('محلل المخاطر');
    expect(roster).not.toContain('__unknown__');
  });
});

describe('Panel of Experts — output schema & formatter', () => {
  const sample = {
    diagnosis:
      'المؤسس يحتاج لتقييم مدى جدوى إطلاق منصة تعليم إلكتروني في مصر مع موارد محدودة، والافتراض الضمني أن المنافسة منخفضة بحاجة للتحدي.',
    options: [
      {
        title: 'إطلاق MVP مدفوع منذ اليوم الأول',
        pros: ['تحقق سريع من الاستعداد للدفع'],
        cons: ['قد يبطئ النمو الفيروسي'],
      },
      {
        title: 'نموذج Freemium مع upsell متأخر',
        pros: ['نمو أسرع'],
        cons: ['مخاطرة ارتفاع تكلفة البنية التحتية'],
      },
      {
        title: 'شراكة مع مدارس قائمة لتقاسم الإيراد',
        pros: ['قنوات توزيع جاهزة'],
        cons: ['اعتماد على بطء قرار المؤسسات'],
      },
    ],
    recommendation:
      'البدء بنموذج MVP مدفوع لجمهور ضيق محدد مع التحضير لشراكات مدارس بعد 3 أشهر.',
    confidence: 78,
    implementationSteps: [
      'حدد الجمهور المستهدف الأول بدقة (مثلاً: طلاب الثانوية العامة).',
      'أطلق نسخة تجريبية بثلاث دورات في أسبوعين.',
      'فعّل قياس مؤشرات الاحتفاظ والتحويل.',
    ],
    qualityNotes: {
      clarity: 90,
      accuracy: 85,
      completeness: 82,
      actionability: 88,
      relevance: 95,
      ethicalReview: 'لا توجد تحيزات أو مخاطر أخلاقية ظاهرة.',
    },
  };

  it('matches the unified schema', () => {
    const parsed = CouncilOutputSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
  });

  it('renders all 5 unified sections in markdown', () => {
    const md = formatCouncilAsMarkdown(
      sample,
      {
        domain: 'strategic',
        experts: ['growth_strategist', 'risk_analyst'],
        routeRationale: 'سؤال استراتيجي حول إطلاق MVP',
        durationMs: 100,
      },
      'مُحلّل الأفكار',
    );
    expect(md).toContain('🏛️');
    expect(md).toContain('### 1) التشخيص');
    expect(md).toContain('### 2) الخيارات الاستراتيجية');
    expect(md).toContain('### 3) التوصية النهائية');
    expect(md).toContain('### 4) مستوى الثقة');
    expect(md).toContain('### 5) خطوات التنفيذ');
    expect(md).toContain('78%');
    expect(md).toContain('استراتيجي النمو');
  });

  it('rejects malformed outputs (e.g., wrong option count)', () => {
    const bad = { ...sample, options: sample.options.slice(0, 2) };
    expect(CouncilOutputSchema.safeParse(bad).success).toBe(false);
  });

  it('clamps confidence to 0-100', () => {
    const bad = { ...sample, confidence: 150 };
    expect(CouncilOutputSchema.safeParse(bad).success).toBe(false);
  });
});

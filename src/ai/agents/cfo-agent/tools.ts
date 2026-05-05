import * as math from 'mathjs';

type FinancialModel = Record<string, number | undefined>;

// أداة تحليل السيناريوهات
export async function runScenarioAnalysis(baseModel: FinancialModel, scenario: { variable: string, changePercent: number }) {
  // مثال بسيط للنمذجة
  const adjustedModel: FinancialModel = { ...baseModel };
  adjustedModel[scenario.variable] = (baseModel[scenario.variable] ?? 0) * (1 + scenario.changePercent / 100);
  
  // إعادة حساب الإيرادات / الأرباح (تبسيط)
  adjustedModel['netProfit'] = (adjustedModel['revenue'] ?? 0) - (adjustedModel['expenses'] ?? 0);
  
  return {
    diff: (adjustedModel['netProfit'] ?? 0) - (baseModel['netProfit'] ?? 0),
    adjustedModel
  };
}

// أداة تقييم الاستثمار (NPV)
export async function evaluateInvestment(params: { cashflows: number[], discountRate: number, initialInvestment: number }) {
    let npv = -params.initialInvestment;
    params.cashflows.forEach((cf, index) => {
        npv += cf / Math.pow(1 + params.discountRate, index + 1);
    });
    return { npv };
}

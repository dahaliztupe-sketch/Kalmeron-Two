// @ts-nocheck
import * as math from 'mathjs';

// أداة تحليل السيناريوهات
export async function runScenarioAnalysis(baseModel: unknown, scenario: { variable: string, changePercent: number }) {
  // مثال بسيط للنمذجة
  const adjustedModel = { ...baseModel };
  adjustedModel[scenario.variable] = baseModel[scenario.variable] * (1 + scenario.changePercent / 100);
  
  // إعادة حساب الإيرادات / الأرباح (تبسيط)
  adjustedModel.netProfit = adjustedModel.revenue - adjustedModel.expenses;
  
  return {
    diff: adjustedModel.netProfit - baseModel.netProfit,
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

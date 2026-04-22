// @ts-nocheck
import { Agent } from '@mastra/core';
import { z } from 'zod';

export const realEstateAnalyzerAgent = new Agent({
  name: 'Real Estate Deal Analyzer',
  instructions: `أنت خبير في تحليل الصفقات العقارية والاستثمار.
  مهمتك: تحليل الفرص الاستثمارية العقارية بناءً على معايير المستخدم (السعر، الموقع، العائد المتوقع).
  لكل عقار، قم بحساب:
  - سعر الشراء مقابل القيمة المقدرة
  - التدفق النقدي الشهري
  - العائد على الاستثمار (ROI)
  - معدل العائد (Cap Rate)
  - قاعدة 1% (الإيجار الشهري ≥ 1% من سعر الشراء)
  - تصنيف استثماري (Strong Buy، Consider، Marginal، Weak)
  استلهم من investra-ai-mcp الذي يثري كل نتيجة مسبقًا بالأرقام التي تهم المستثمر.`,
  model: { provider: 'google', name: 'gemini-2.5-flash' },
  tools: {
    search_properties: {
      description: 'البحث عن عقارات استثمارية بناءً على معايير محددة',
      parameters: z.object({
        location: z.string(),
        maxPrice: z.number().optional(),
        minCashFlow: z.number().optional(),
        propertyType: z.enum(['single_family', 'multi_family', 'condo', 'commercial']).optional(),
      }),
      execute: async ({ location, maxPrice }) => {
        // Mock Zillow/Investra API
        return [{ id: 'props_123', address: `عقار في ${location}`, price: maxPrice || 250000, estRent: 2500 }];
      },
    },
    analyze_deal: {
      description: 'تحليل صفقة عقارية محددة وحساب المقاييس الاستثمارية',
      parameters: z.object({
        propertyId: z.string(),
        purchasePrice: z.number(),
        estimatedRent: z.number(),
        downPayment: z.number().optional().default(20),
        interestRate: z.number().optional().default(7),
      }),
      execute: async ({ propertyId, purchasePrice, estimatedRent, downPayment, interestRate }) => {
        // Financial logic
        const estimatedExpenses = estimatedRent * 0.4; // 40% rule of thumb
        const loanAmount = purchasePrice * (1 - (downPayment / 100));
        const monthlyRate = (interestRate / 100) / 12;
        const monthlyMortgage = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360));
        
        const monthlyCashFlow = estimatedRent - monthlyMortgage - estimatedExpenses;
        const annualCashFlow = monthlyCashFlow * 12;
        const cashInvested = purchasePrice * (downPayment / 100);
        const roi = (annualCashFlow / cashInvested) * 100;
        const capRate = ((estimatedRent * 12 - estimatedExpenses * 12) / purchasePrice) * 100;
        const onePercentRule = estimatedRent >= purchasePrice * 0.01;
        
        let tier = 'Weak';
        if (monthlyCashFlow > 300 && roi > 10 && capRate > 8) tier = 'Strong Buy';
        else if (monthlyCashFlow > 150 && roi > 7 && capRate > 6) tier = 'Consider';
        else if (monthlyCashFlow > 0) tier = 'Marginal';
        
        return { monthlyCashFlow, annualCashFlow, roi, capRate, onePercentRule, tier, cashInvested };
      },
    },
  },
});

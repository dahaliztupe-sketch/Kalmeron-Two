import { cache } from 'react';
import { analyzeCompany as analyzeCompanyOriginal } from '@/src/agents/success-museum/agent'; // Adjust import as per real path
import { getPersonalizedOpportunities as getPersonalizedOpportunitiesOriginal } from '@/src/agents/opportunity-radar/agent';

// Note: Ensure original functions support caching
export const analyzeCompany = cache(async (companyId: string) => {
  'use cache';
  return await analyzeCompanyOriginal(companyId, ""); 
});

export const getPersonalizedOpportunities = cache(async (userId: string) => {
  'use cache';
  return await getPersonalizedOpportunitiesOriginal('technology', 'seed', 'Cairo'); 
});

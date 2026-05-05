// ts-nocheck: reason=@mastra/core Supervisor requires a separate architectural migration; complex external dependency
// @ts-nocheck
import { Supervisor } from '@mastra/core';
import { ideaValidator } from '@/src/agents/idea-validator/agent';
import { planBuilder } from '@/src/agents/plan-builder/agent';
import { legalGuideAgent } from '@/src/ai/agents/legal-guide/agent';
import { marketingCrew } from '@/src/crews/prototypes/marketing-crew';

// ═══ قسم المالية — Finance Department Agents ═══
import { financialModelingAgent } from '@/src/ai/organization/departments/finance/financial_modeling.agent';
import { equityManagerAgent } from '@/src/ai/organization/departments/finance/equity_manager.agent';
import { valuationExpertAgent } from '@/src/ai/organization/departments/finance/valuation_expert.agent';
import { investorRelationsAgent } from '@/src/ai/organization/departments/finance/investor_relations.agent';

// ═══ قسم المبيعات — Sales Department Agents ═══
import { leadQualifierAgent } from '@/src/ai/organization/departments/sales/lead_qualifier.agent';
import { salesPipelineAnalystAgent } from '@/src/ai/organization/departments/sales/sales_pipeline_analyst.agent';
import { salesPitchDeckCreatorAgent } from '@/src/ai/organization/departments/sales/sales_pitch_deck_creator.agent';
import { salesStrategyDeveloperAgent } from '@/src/ai/organization/departments/sales/sales_strategy_developer.agent';
import { founderLedSalesCoachAgent } from '@/src/ai/organization/departments/sales/founder_led_sales_coach.agent';

// ═══ قسم التسويق — Marketing Department Agents ═══
import { contentCreatorAgent } from '@/src/ai/organization/departments/marketing/content_creator.agent';
import { seoManagerAgent } from '@/src/ai/organization/departments/marketing/seo_manager.agent';
import { adsCampaignManagerAgent } from '@/src/ai/organization/departments/marketing/ads_campaign_manager.agent';
import { acquisitionStrategistAgent } from '@/src/ai/organization/departments/marketing/acquisition_strategist.agent';
import { customerProfilingAgent } from '@/src/ai/organization/departments/marketing/customer_profiling.agent';

// ═══ قسم التقنية — Product & Tech Department Agents ═══
import { productManagerAgent } from '@/src/ai/organization/departments/product/product_manager.agent';
import { systemArchitectAgent } from '@/src/ai/organization/departments/product/system_architect.agent';
import { devopsEngineerAgent } from '@/src/ai/organization/departments/product/devops_engineer.agent';
import { qaManagerAgent } from '@/src/ai/organization/departments/product/qa_manager.agent';
import { uxOptimizationAgent } from '@/src/ai/organization/departments/product/ux_optimization.agent';
import { mvpDeveloperAgent } from '@/src/ai/organization/departments/product/mvp_developer.agent';

// ═══ قسم القانوني — Legal Department Agents ═══
import { contractDrafterAgent } from '@/src/ai/organization/departments/legal/contract_drafter.agent';
import { ipProtectionExpertAgent } from '@/src/ai/organization/departments/legal/ip_protection_expert.agent';
import { dataPrivacyComplianceAuditorAgent } from '@/src/ai/organization/departments/legal/data_privacy_compliance_auditor.agent';
import { foundersAgreementAdvisorAgent } from '@/src/ai/organization/departments/legal/founders_agreement_advisor.agent';
import { investmentAgreementSpecialistAgent } from '@/src/ai/organization/departments/legal/investment_agreement_specialist.agent';

// ═══ قسم الموارد البشرية — HR Department Agents ═══
import { companyCultureExpertAgent } from '@/src/ai/organization/departments/hr/company_culture_expert.agent';
import { jobDescriptionWriterAgent } from '@/src/ai/organization/departments/hr/job_description_writer.agent';
import { orgStructureDesignerAgent } from '@/src/ai/organization/departments/hr/org_structure_designer.agent';
import { processOptimizerAgent } from '@/src/ai/organization/departments/hr/process_optimizer.agent';

// ═══ قسم دعم العملاء — Support Department Agents ═══
import { csatAnalystAgent } from '@/src/ai/organization/departments/support/csat_analyst.agent';
import { knowledgeBaseBuilderAgent } from '@/src/ai/organization/departments/support/knowledge_base_builder.agent';
import { ticketManagerAgent } from '@/src/ai/organization/departments/support/ticket_manager.agent';
import { supportIdentityExpertAgent } from '@/src/ai/organization/departments/support/support_identity_expert.agent';

/**
 * Mastra Supervisor — منسّق الوكلاء الرئيسي
 * يجمع كل وكلاء الأقسام ويُوجّه المهام بذكاء بينهم.
 */
const allDepartmentAgents = [
  leadQualifierAgent,
  salesPipelineAnalystAgent,
  salesPitchDeckCreatorAgent,
  salesStrategyDeveloperAgent,
  founderLedSalesCoachAgent,
  contentCreatorAgent,
  seoManagerAgent,
  adsCampaignManagerAgent,
  acquisitionStrategistAgent,
  customerProfilingAgent,
  productManagerAgent,
  systemArchitectAgent,
  devopsEngineerAgent,
  qaManagerAgent,
  uxOptimizationAgent,
  mvpDeveloperAgent,
  financialModelingAgent,
  equityManagerAgent,
  valuationExpertAgent,
  investorRelationsAgent,
  contractDrafterAgent,
  ipProtectionExpertAgent,
  dataPrivacyComplianceAuditorAgent,
  foundersAgreementAdvisorAgent,
  investmentAgreementSpecialistAgent,
  companyCultureExpertAgent,
  jobDescriptionWriterAgent,
  orgStructureDesignerAgent,
  processOptimizerAgent,
  csatAnalystAgent,
  knowledgeBaseBuilderAgent,
  ticketManagerAgent,
  supportIdentityExpertAgent,
].filter(Boolean);

export const supervisor = new Supervisor({
  agents: [
    ideaValidator,
    planBuilder,
    legalGuideAgent,
    marketingCrew,
    ...allDepartmentAgents,
  ],
  delegationHook: async (task: string, agent: { name: string }) => {
    // task delegated to agent
  },
  completionScoring: true,
  memoryIsolation: true,
  bailMechanism: true,
});

export async function orchestrateComplexTask(userGoal: string) {
  return await supervisor.stream(userGoal);
}

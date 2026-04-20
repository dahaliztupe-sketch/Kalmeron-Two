// @ts-nocheck
export interface StartupDigitalTwin {
  startupId: string;
  userId: string;
  name: string;
  foundedAt?: Date;
  vision: {
    mission: string;
    longTermGoal: string;
    uniqueValueProposition: string;
  };
  market: {
    industry: string;
    subIndustry?: string;
    targetAudience: {
      demographics: string[];
      painPoints: string[];
      personas: Array<{ name: string; description: string }>;
    };
    competitors: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      marketShare?: number;
    }>;
    marketSize: {
      tam?: number;
      sam?: number;
      som?: number;
    };
  };
  product: {
    name: string;
    description: string;
    features: string[];
    stage: 'idea' | 'mvp' | 'beta' | 'launched' | 'scaling';
    techStack: string[];
    ip: {
      patents: string[];
      trademarks: string[];
    };
  };
  team: {
    founders: Array<{
      name: string;
      role: string;
      expertise: string[];
      equity?: number;
    }>;
    keyHires: string[];
    teamSize: number;
  };
  financials: {
    fundingStage: 'pre-seed' | 'seed' | 'seriesA' | 'seriesB' | 'bootstrapped';
    totalRaised?: number;
    monthlyRevenue?: number;
    burnRate?: number;
    runway?: number;
    valuation?: number;
  };
  metrics: {
    mau?: number;
    cac?: number;
    ltv?: number;
    churnRate?: number;
    nps?: number;
  };
  dynamicContext: {
    recentActivities: string[];
    activeChallenges: string[];
    upcomingMilestones: string[];
    lastUpdated: Date;
  };
  embedding?: number[];
}

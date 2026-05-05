declare module '@vercel/ai-gateway' {
  import type { LanguageModel } from 'ai';

  export interface GatewayRoute {
    condition: (task: GatewayTask) => boolean;
    model: string;
    provider: string;
  }

  export interface GatewayTask {
    complexity?: 'simple' | 'medium' | 'complex';
    [key: string]: unknown;
  }

  export interface GatewayObservability {
    enabled: boolean;
    metrics: string[];
  }

  export interface GatewayAlerts {
    dailyBudget: number;
    perRequestBudget: number;
  }

  export interface GatewayOptions {
    routes: GatewayRoute[];
    observability?: GatewayObservability;
    alerts?: GatewayAlerts;
  }

  export function createGateway(options: GatewayOptions): LanguageModel;
}

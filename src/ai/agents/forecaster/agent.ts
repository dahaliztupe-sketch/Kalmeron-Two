import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { FORECASTER_PROMPT } from './prompt';

// Nixtla client type — defined locally so no static import is needed.
// The actual module is loaded dynamically at runtime only when present.
type NixtlaClientType = {
  forecast(opts: { df: unknown; h: number; freq: string; timeCol: string; targetCol: string }): Promise<unknown>;
  detectAnomalies(opts: { df: unknown; freq: string; timeCol: string; targetCol: string; level: number }): Promise<unknown>;
};

// Initialize Nixtla lazily via dynamic import so a missing package does not
// throw MODULE_NOT_FOUND at module load time.
let nixtla: NixtlaClientType | null = null;
(async () => {
  try {
    if (process.env.NIXTLA_API_KEY) {
      const mod = await import('nixtla' as string) as { NixtlaClient: new (opts: { apiKey: string }) => NixtlaClientType };
      nixtla = new mod.NixtlaClient({ apiKey: process.env.NIXTLA_API_KEY });
    }
  } catch {
    // nixtla package not installed — all calls fall back to LLM heuristic
  }
})();

export const ForecasterAgent = {
  role: 'المحلل المالي التنبؤي (Predicitve CFO)',
  goal: 'استشراف المستقبل المالي واكتشاف الشذوذ المالي باستخدام الذكاء الاصطناعي التنبؤي.',
  
  async predictRevenue(historicalData: { timestamp: string, value: number }[], horizon: number = 6) {
    return instrumentAgent('forecaster.predict_revenue', async () => {
    if (!nixtla) {
      // Nixtla not configured — using LLM heuristic fallback
      return this.fallbackLLMPrediction(historicalData, horizon);
    }

    try {
      // Invoke TimeGPT for highly accurate series forecasting
      const forecast = await nixtla.forecast({
        df: historicalData,
        h: horizon,
        freq: 'MS', // Monthly start
        timeCol: 'timestamp',
        targetCol: 'value'
      });
      return forecast;
    } catch (error) {
      throw error;
    }
    }, { model: 'nixtla.timegpt', toolsUsed: ['nixtla.forecast'] });
  },

  async detectAnomalies(historicalData: { timestamp: string, value: number }[]) {
    if (!nixtla) return { anomalies: [] };
    // Invoke TimeGPT for anomaly detection (e.g., sudden drop in MRR)
    const anomalies = await nixtla.detectAnomalies({
      df: historicalData,
      freq: 'MS',
      timeCol: 'timestamp',
      targetCol: 'value',
      level: 99 // 99% confidence interval
    });
    return anomalies;
  },

  async fallbackLLMPrediction(data: unknown[], horizon: number) {
     const { text } = await generateText({
        model: MODELS.PRO,
        system: FORECASTER_PROMPT,
        prompt: `Predict the next ${horizon} months of revenue based on this historical data: ${JSON.stringify(data)}. 
        Return a JSON array of objects with { timestamp, value }. Explain briefly the trend in Arabic.`
     });
     return { forecast: text, method: "LLM_Heuristics" };
  }
};

import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
// Using Nixtla for Time-Series forecasting & anomaly detection
import { NixtlaClient } from 'nixtla';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { FORECASTER_PROMPT } from './prompt';

// Initialize Nixtla (Requires NIXTLA_API_KEY in environment)
// Fallback gracefully if the package or key isn't fully set in this environment
let nixtla: NixtlaClient | null = null;
try {
  nixtla = process.env.NIXTLA_API_KEY ? new NixtlaClient({ apiKey: process.env.NIXTLA_API_KEY }) : null;
} catch (e) {
  // Nixtla not injected yet
}

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
      // error is re-thrown below
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
        model: MODELS.PRO_PREVIEW,
        system: FORECASTER_PROMPT,
        prompt: `Predict the next ${horizon} months of revenue based on this historical data: ${JSON.stringify(data)}. 
        Return a JSON array of objects with { timestamp, value }. Explain briefly the trend in Arabic.`
     });
     return { forecast: text, method: "LLM_Heuristics" };
  }
};

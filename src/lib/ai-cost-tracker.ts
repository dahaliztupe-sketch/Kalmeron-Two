// @ts-nocheck
interface CostReportParams {
  startDate: Date;
  endDate: Date;
  groupBy?: 'model' | 'provider' | 'userId' | 'feature';
}

export async function getAICostReport(params: CostReportParams) {
  if(!process.env.VERCEL_API_TOKEN) {
    return { error: 'Vercel API Token missing' };
  }
  
  const response = await fetch('https://api.vercel.com/v1/ai-gateway/spend-report', {
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      start: params.startDate.toISOString(),
      end: params.endDate.toISOString(),
      groupBy: params.groupBy || 'model',
    }),
  });
  
  return response.json();
}

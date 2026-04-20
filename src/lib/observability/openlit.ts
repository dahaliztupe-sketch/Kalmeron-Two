// @ts-nocheck
// Placeholder for OpenLIT. 
// Replace with actual @openlit/sdk when available.
export const tracer = {
  startActiveSpan: async (name: string, fn: (span: any) => Promise<any>) => {
    return await fn({ setStatus: (s: any) => {}, end: () => {} });
  },
};

export const agentCallCounter = { add: (n: number, tags: any) => console.log('Agent call', n, tags) };
export const agentLatencyHistogram = { record: (n: number, tags: any) => console.log('Latency', n, tags) };
export const tokenUsageCounter = { add: (n: number, tags: any) => console.log('Tokens', n, tags) };

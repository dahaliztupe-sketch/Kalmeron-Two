// @ts-nocheck
// Placeholder for OpenLIT. 
// Replace with actual @openlit/sdk when available.
export const tracer = {
  startActiveSpan: async (name: string, fn: (span: unknown) => Promise<unknown>) => {
    return await fn({ setStatus: (s: unknown) => {}, end: () => {} });
  },
};

export const agentCallCounter = { add: (n: number, tags: unknown) => console.log('Agent call', n, tags) };
export const agentLatencyHistogram = { record: (n: number, tags: unknown) => console.log('Latency', n, tags) };
export const tokenUsageCounter = { add: (n: number, tags: unknown) => console.log('Tokens', n, tags) };

// @ts-nocheck
// Placeholder for OpenLIT. 
// Replace with actual @openlit/sdk when available.
export const tracer = {
  startActiveSpan: async (name: string, fn: (span: unknown) => Promise<unknown>) => {
    return await fn({ setStatus: (s: unknown) => {}, end: () => {} });
  },
};

export const agentCallCounter = { add: (_n: number, _tags: unknown) => { /* stub */ } };
export const agentLatencyHistogram = { record: (_n: number, _tags: unknown) => { /* stub */ } };
export const tokenUsageCounter = { add: (_n: number, _tags: unknown) => { /* stub */ } };

// @ts-nocheck
// Placeholder for Langfuse. 
// Replace with actual @langfuse/core when available.
export const langfuse = {
  trace: (params: any) => ({
    id: 'mock-trace-id',
    span: (params: any) => ({ end: (params: any) => console.log('Span ended', params) }),
    update: (params: any) => console.log('Trace updated', params),
  }),
  score: (params: any) => console.log('Score logged', params),
  flush: async () => console.log('Langfuse flushed'),
};

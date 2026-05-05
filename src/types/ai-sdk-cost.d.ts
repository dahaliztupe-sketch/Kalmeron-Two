declare module 'ai-sdk-cost' {
  export interface CostLog {
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    cost?: number;
    [key: string]: unknown;
  }

  export type Sink = (log: CostLog) => Promise<void> | void;

  export interface TelemetryOptions {
    sink: Sink;
  }

  export interface Telemetry {
    trackUsage(log: CostLog): void;
  }

  export function initAiSdkCostTelemetry(options: TelemetryOptions): Telemetry;
  export function consoleSink(log: CostLog): void;
  export function callbackSink(cb: (log: CostLog) => Promise<void> | void): Sink;
}

export interface SLOConfig {
  name: string;
  target: number;
  unit?: string;
  windowMs: number;
}

export interface SLOStatus {
  name: string;
  target: number;
  current: number;
  unit?: string;
  healthy: boolean;
}

export interface SREReport {
  healthy: boolean;
  circuitBreakerOpen: boolean;
  killSwitchActive: boolean;
  slos: SLOStatus[];
}

interface RequestSample {
  timestampMs: number;
  latencyMs: number;
  success: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_30_DAYS = 30 * MS_PER_DAY;

const SLO_CONFIGS: SLOConfig[] = [
  { name: 'availability', target: 99.9, windowMs: MS_PER_30_DAYS },
  { name: 'latency', target: 2000, unit: 'ms', windowMs: MS_PER_DAY },
  { name: 'error_rate', target: 1, unit: '%', windowMs: MS_PER_DAY },
];

const ERROR_RATE_SLO_TARGET = 1;
const CHAOS_ENABLED = process.env.NODE_ENV === 'production';

class AgentSREImpl {
  private samples: RequestSample[] = [];
  private circuitOpen: boolean = false;
  private killSwitchActive: boolean = false;
  private readonly sloConfigs: SLOConfig[] = SLO_CONFIGS;
  readonly chaosEngineering: boolean = CHAOS_ENABLED;

  private now(): number {
    return Date.now();
  }

  private pruneOldSamples(windowMs: number): void {
    const cutoff = this.now() - windowMs;
    this.samples = this.samples.filter((s) => s.timestampMs >= cutoff);
  }

  private getSamplesInWindow(windowMs: number): RequestSample[] {
    const cutoff = this.now() - windowMs;
    return this.samples.filter((s) => s.timestampMs >= cutoff);
  }

  private computeErrorRate(windowMs: number): number {
    const window = this.getSamplesInWindow(windowMs);
    if (window.length === 0) return 0;
    const failed = window.filter((s) => !s.success).length;
    return (failed / window.length) * 100;
  }

  private computeAvailability(windowMs: number): number {
    const window = this.getSamplesInWindow(windowMs);
    if (window.length === 0) return 100;
    const succeeded = window.filter((s) => s.success).length;
    return (succeeded / window.length) * 100;
  }

  private computeAvgLatency(windowMs: number): number {
    const window = this.getSamplesInWindow(windowMs);
    if (window.length === 0) return 0;
    return window.reduce((sum, s) => sum + s.latencyMs, 0) / window.length;
  }

  private evaluateCircuitBreaker(): void {
    const errorRateSLO = this.sloConfigs.find((s) => s.name === 'error_rate')!;
    const currentErrorRate = this.computeErrorRate(errorRateSLO.windowMs);
    if (currentErrorRate > ERROR_RATE_SLO_TARGET) {
      this.tripCircuitBreaker();
    }
  }

  recordRequest(latencyMs: number, success: boolean): void {
    this.samples.push({ timestampMs: this.now(), latencyMs, success });
    this.pruneOldSamples(MS_PER_30_DAYS);
    this.evaluateCircuitBreaker();
  }

  recordError(errorDetails: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[AgentSRE] Error recorded: ${errorDetails}`);
    }
    this.recordRequest(0, false);
  }

  tripCircuitBreaker(): void {
    if (!this.circuitOpen) {
      this.circuitOpen = true;
      if (process.env.NODE_ENV !== 'production') {
        const rate = this.computeErrorRate(MS_PER_DAY);
        console.error(
          `[AgentSRE] Circuit breaker tripped — error_rate ${rate.toFixed(2)}% exceeds SLO target of ${ERROR_RATE_SLO_TARGET}%`,
        );
      }
    }
  }

  activateKillSwitch(): void {
    this.killSwitchActive = true;
    if (process.env.NODE_ENV !== 'production') {
      console.error('[AgentSRE] Kill switch activated — all agent operations halted');
    }
  }

  isHealthy(): boolean {
    return !this.circuitOpen && !this.killSwitchActive;
  }

  reset(): void {
    this.samples = [];
    this.circuitOpen = false;
    this.killSwitchActive = false;
  }

  getSLOStatuses(): SLOStatus[] {
    return this.sloConfigs.map((slo) => {
      let current: number;
      let healthy: boolean;

      if (slo.name === 'availability') {
        current = this.computeAvailability(slo.windowMs);
        healthy = current >= slo.target;
      } else if (slo.name === 'latency') {
        current = this.computeAvgLatency(slo.windowMs);
        healthy = current <= slo.target;
      } else if (slo.name === 'error_rate') {
        current = this.computeErrorRate(slo.windowMs);
        healthy = current <= slo.target;
      } else {
        current = 0;
        healthy = true;
      }

      return { name: slo.name, target: slo.target, current, unit: slo.unit, healthy };
    });
  }

  getReport(): SREReport {
    const slos = this.getSLOStatuses();
    return {
      healthy: this.isHealthy(),
      circuitBreakerOpen: this.circuitOpen,
      killSwitchActive: this.killSwitchActive,
      slos,
    };
  }
}

export const agentSRE = new AgentSREImpl();
export const globalAgentSRE = agentSRE;

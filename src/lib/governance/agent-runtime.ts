export type RingName = 'ring0' | 'ring1' | 'ring2' | 'ring3';

export interface ExecutionRingConfig {
  name: RingName;
  privileges: string[];
}

export interface SagaStep<T = unknown> {
  name: string;
  execute: () => Promise<T>;
  rollback?: (result?: T) => Promise<void>;
}

export interface SagaResult<T = unknown> {
  success: boolean;
  results: T[];
  failedStep?: string;
  error?: string;
}

const EXECUTION_RINGS: ExecutionRingConfig[] = [
  { name: 'ring0', privileges: ['kernel', 'security'] },
  { name: 'ring1', privileges: ['admin', 'compliance'] },
  { name: 'ring2', privileges: ['user', 'read'] },
  { name: 'ring3', privileges: ['guest'] },
];

const RING_PRIORITY: Record<RingName, number> = {
  ring0: 0,
  ring1: 1,
  ring2: 2,
  ring3: 3,
};

class AgentRuntimeImpl {
  private readonly rings: ExecutionRingConfig[] = EXECUTION_RINGS;
  private _killSwitch: boolean = false;

  get killSwitch(): boolean {
    return this._killSwitch;
  }

  activateKillSwitch(): void {
    this._killSwitch = true;
  }

  deactivateKillSwitch(): void {
    this._killSwitch = false;
  }

  getRing(name: RingName): ExecutionRingConfig | undefined {
    return this.rings.find((r) => r.name === name);
  }

  hasPrivilege(ringName: RingName, privilege: string): boolean {
    const ring = this.getRing(ringName);
    return ring ? ring.privileges.includes(privilege) : false;
  }

  canAccessRing(requesterRing: RingName, targetRing: RingName): boolean {
    return RING_PRIORITY[requesterRing] <= RING_PRIORITY[targetRing];
  }

  async runSaga<T = unknown>(steps: SagaStep<T>[]): Promise<SagaResult<T>> {
    if (this._killSwitch) {
      return { success: false, results: [], failedStep: 'pre-check', error: 'Kill switch is active' };
    }

    const results: T[] = [];
    const completedSteps: Array<{ step: SagaStep<T>; result: T }> = [];

    for (const step of steps) {
      if (this._killSwitch) {
        await this.rollbackCompleted(completedSteps);
        return {
          success: false,
          results,
          failedStep: step.name,
          error: 'Kill switch activated during saga execution',
        };
      }

      try {
        const result = await step.execute();
        results.push(result);
        completedSteps.push({ step, result });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        await this.rollbackCompleted(completedSteps);
        return { success: false, results, failedStep: step.name, error };
      }
    }

    return { success: true, results };
  }

  private async rollbackCompleted<T>(completed: Array<{ step: SagaStep<T>; result: T }>): Promise<void> {
    for (const { step, result } of [...completed].reverse()) {
      if (step.rollback) {
        try {
          await step.rollback(result);
        } catch {
        }
      }
    }
  }
}

export const agentRuntime = new AgentRuntimeImpl();

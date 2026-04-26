// @ts-nocheck
  /**
   * Inter-Agent Communication Protocol
   * EventEmitter (in-process) — قابل للترقية إلى Redis Pub/Sub عند التوسع.
   */
  import { EventEmitter } from 'events';
  import { recordInvocation } from '../compliance/monitor';

  export type MessageType = 'task' | 'query' | 'response' | 'alert';
  export type Priority = 'low' | 'medium' | 'high' | 'critical';

  export interface AgentMessage {
    from: string;
    to: string;
    type: MessageType;
    payload: unknown;
    timestamp?: Date;
    priority?: Priority;
  }

  const bus = new EventEmitter();
  bus.setMaxListeners(200);

  export function subscribe(agentId: string, handler: (msg: AgentMessage) => Promise<unknown> | unknown) {
    bus.on(`msg:${agentId}`, async (msg: AgentMessage) => {
      const start = Date.now();
      try {
        const result = await handler(msg);
        recordInvocation(agentId, Date.now() - start, 0);
        if (msg.from && msg.type === 'task') {
          bus.emit(`msg:${msg.from}`, {
            from: agentId, to: msg.from, type: 'response',
            payload: result, timestamp: new Date(), priority: msg.priority,
          });
        }
      } catch (err: unknown) {
        recordInvocation(agentId, Date.now() - start, 0, err?.message);
      }
    });
  }

  export async function sendMessage(msg: AgentMessage): Promise<unknown> {
    const enriched: AgentMessage = { ...msg, timestamp: msg.timestamp || new Date() };
    bus.emit(`msg:${msg.to}`, enriched);
    // For request-response pattern, wait briefly for ACK; otherwise return enqueued ack.
    return Promise.resolve({ enqueued: true, to: msg.to, type: msg.type });
  }

  export function getBus() { return bus; }
  
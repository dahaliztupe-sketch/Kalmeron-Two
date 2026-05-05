declare module 'mem0ai' {
  export interface Mem0Config {
    userId?: (user: unknown) => string;
    config?: {
      vectorStore?: { provider: string };
      llm?: { provider: string; model: string };
    };
  }

  export interface Mem0SearchOptions {
    user_id: string;
    limit?: number;
  }

  export interface Mem0AddOptions {
    user_id: string;
  }

  export interface Mem0Message {
    role: 'user' | 'assistant';
    content: unknown;
  }

  export class Mem0 {
    constructor(config: Mem0Config);
    search(query: string, options: Mem0SearchOptions): Promise<unknown[]>;
    add(messages: Mem0Message[], options: Mem0AddOptions): Promise<void>;
  }
}

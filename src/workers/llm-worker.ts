import { MLCEngine } from '@mlc-ai/web-llm';
import * as Comlink from 'comlink';

const worker = {
  async createEngine(modelId, callback) {
    const engine = await import('@mlc-ai/web-llm').then(m => 
      m.CreateMLCEngine(modelId, {
        initProgressCallback: (report) => callback(report.progress * 100),
      })
    );
    return Comlink.proxy(engine);
  },
};

Comlink.expose(worker);

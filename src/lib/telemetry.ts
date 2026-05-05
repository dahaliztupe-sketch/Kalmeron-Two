import { initAiSdkCostTelemetry, callbackSink } from 'ai-sdk-cost';
import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const telemetry = initAiSdkCostTelemetry({
  sink: callbackSink(async (log) => {
    await addDoc(collection(db, 'ai_usage_logs'), {
      ...log,
      timestamp: new Date(),
    });
  }),
});

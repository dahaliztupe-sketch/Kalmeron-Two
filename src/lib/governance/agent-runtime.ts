// @ts-nocheck
import { AgentRuntime } from '@agentmesh/sdk';

export const agentRuntime = new AgentRuntime({
  executionRings: [
    { name: 'ring0', privileges: ['kernel', 'security'] }, // الحلقة الداخلية - الأدوات الحساسة
    { name: 'ring1', privileges: ['admin', 'compliance'] },
    { name: 'ring2', privileges: ['user', 'read'] },
    { name: 'ring3', privileges: ['guest'] }, // الحلقة الخارجية - وضع الضيف
  ],
  killSwitch: true, // زر القتل الطارئ
  sagaOrchestration: true, // تنسيق المعاملات متعددة الخطوات لحماية البيانات
});

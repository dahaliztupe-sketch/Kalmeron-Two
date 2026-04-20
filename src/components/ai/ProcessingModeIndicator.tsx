// @ts-nocheck
'use client';
export function ProcessingModeIndicator({ mode }) {
  return (
    <div className={`p-2 rounded ${mode === 'local' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
      {mode === 'local' ? '🖥️ المعالجة المحلية (خارج الاتصال)' : '☁️ المعالجة السحابية'}
    </div>
  );
}

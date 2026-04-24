// @ts-nocheck

// 1. الطبقة الأولى: التطهير الدلالي (Semantic Sanitization)
export function sanitizeInput(input: string): string {
  // إزالة تعليمات النظام المخفية
  const cleaned = input.replace(/\[SYSTEM\]|\[INST\]|<<HIDDEN>>|\[AGENT\]|\[TOOL\]/gi, '');
  // إزالة محاولات تجاوز السياق
  return cleaned.replace(/ignore previous|disregard|override|bypass/gi, '');
}

// 2. الطبقة الثانية: عزل المدخلات (Input Context Isolation)
export function isolateUserInput(input: string): string {
  // فصل صارم بين محتوى المستخدم وتعليمات النظام
  return `<user_input>\n${input}\n</user_input>`;
}

// 3. الطبقة الثالثة: التحقق من سلامة التحكم في التدفق (Prompt Control-Flow Integrity)
export function validatePromptIntegrity(_systemPrompt: string, userInput: string): boolean {
  // التحقق من أن مدخلات المستخدم لا تحاول محاكاة تعليمات النظام
  const suspiciousPatterns = [
    'you are now',
    'your new role',
    'ignore your instructions',
    'system prompt',
  ];

  return !suspiciousPatterns.some(pattern =>
    userInput.toLowerCase().includes(pattern.toLowerCase())
  );
}

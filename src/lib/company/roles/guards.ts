/** Shared text guards for role quality checks. Heuristics only: they catch obvious problems, not all of them. */
import type { Issue } from "./spec";

export const OVERPROMISE = /(مضمون|ضمان|نضمن|100\s*%|بدون مخاطر|بلا مخاطر|بدون ثغرات|آمن تماماً|لا يمكن اختراق|حتماً)/;
export const STAT = /(\d+(\.\d+)?\s*(%|٪)|\d+\s*(مليون|مليار))/;
export const SECRET = /(AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN|password\s*[:=]\s*\S+|كلمة المرور\s*[:=]\s*\S+)/i;

export function proseGuards(prose: string[], acts: RegExp, actsMessage: string): Issue[] {
  const issues: Issue[] = [];
  if (prose.some((t) => OVERPROMISE.test(t))) issues.push({ level: "error", code: "overpromise", message: "نص يحتوي وعداً أو ضماناً بنتيجة أو بالأمان." });
  if (prose.some((t) => acts.test(t))) issues.push({ level: "error", code: "acts_outside_role", message: actsMessage });
  if (prose.some((t) => SECRET.test(t))) issues.push({ level: "error", code: "secret_in_output", message: "المخرج يحتوي ما يشبه مفتاحاً أو كلمة مرور. لا تضع أسراراً في الخطط." });
  if (prose.some((t) => STAT.test(t))) issues.push({ level: "warn", code: "unsupported_statistic", message: "رقم أو نسبة داخل النص بلا وسم basis. راجعه." });
  return issues;
}

export const hasConsultLine = (t: string, words: RegExp) => words.test(t);

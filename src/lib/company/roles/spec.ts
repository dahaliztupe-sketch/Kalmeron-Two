import type { ZodType } from "zod";
import type { CompanyBrief } from "@/src/lib/company/brief";

export type Issue = { level: "error" | "warn"; code: string; message: string };

/** A role agent: a job description, a system prompt, an output contract and a quality check. */
export interface RoleSpec<T> {
  id: string;
  titleAr: string;
  mission: string;
  /** What this role must refuse or hand to another role. Shown to the user and put in the prompt. */
  outOfScope: string[];
  systemPrompt: string;
  outputSchema: ZodType<T>;
  /** JSON shape description appended to the prompt so the model knows the exact keys. */
  outputShape: string;
  checks: (out: T, brief: CompanyBrief) => Issue[];
}

export const COMMON_RULES = `قواعد ملزمة لكل الأدوار:
- اكتب بالعربية الواضحة. لا مبالغة ولا وعود بنتائج.
- لا تخترع إحصاءات أو أحجام سوق أو أسعار منافسين. إن لم تكن المعلومة في الملخص فاكتب أنها افتراض أو تحتاج تحقق.
- كل بند رقمي أو ادعائي يحمل basis: "assumption" أو "user_fact" أو "needs_check".
- التزم بالميزانية والمدة في الملخص إن وُجدتا.
- أنت تُعدّ خطة ومسودات فقط. لا تنشر ولا ترسل ولا تدفع ولا تنفّذ نيابة عن المستخدم.
- إن طُلب منك شيء خارج دورك فاذكر في حقل handoff أي دور يناسبه بدل تنفيذه.
- اختصر لتسرع الاستجابة: كل نص جملة واحدة قصيرة (نحو 20 كلمة أو أقل)، واستخدم عدداً معتدلاً من البنود في كل قائمة (لا الحد الأدنى ولا الأقصى)، ولا تكرر ما في الملخص.
- أخرج كائن JSON واحداً فقط بلا شرح خارجه.`;

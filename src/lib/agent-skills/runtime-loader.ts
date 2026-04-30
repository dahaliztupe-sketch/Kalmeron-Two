/**
 * Runtime Agent-Skills Loader
 * ----------------------------
 * يقرأ ملفّات `SKILL.md` المُسجّلة لكلّ وكيل ويُنسّقها كنصّ جاهز للحقن
 * في system prompt. يعمل بالتزامن مع `instrumentAgent` ودورة التعلّم
 * الذاتيّ (LearnedSkill) — هذه هي المهارات "البذريّة" (Bootstrap) التي
 * تأتي مع المنصّة، بينما LearnedSkill تتراكم عبر الاستخدام.
 *
 * - يقرأ من `.agents/skills/` نسبيّاً إلى جذر المستودع.
 * - يستخرج `name` و `description` من YAML frontmatter بدون أيّة تبعيّة
 *   خارجيّة (regex خفيف) لتجنّب إضافة `yaml` كـ runtime dep.
 * - يُخزّن النتائج المنسّقة في الذاكرة بعد أوّل قراءة.
 * - يُحدّد سقفاً للمحتوى (~600 char/skill) للحفاظ على حجم الـ prompt.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { getRegisteredSkillPaths } from './registry';

/** جذر مجلّد المهارات بالنسبة إلى الـ CWD (جذر المستودع في Replit/Next). */
const SKILLS_ROOT = path.resolve(process.cwd(), '.agents', 'skills');

/** سقف عدد الأحرف لكلّ مهارة محقونة (لتجنّب تضخّم الـ prompt). */
const MAX_CHARS_PER_SKILL = 600;

interface ParsedSkill {
  /** اسم المهارة من frontmatter — قصير ومُعرَّف. */
  name: string;
  /** الوصف الكامل من frontmatter — يخبر النموذج متى يستخدم المهارة. */
  description: string;
  /** ملخّص الجسم الأوّل (أوّل قسم بعد العنوان) — اختياريّ. */
  summary: string;
}

const PARSE_CACHE = new Map<string, ParsedSkill | null>();
const FORMATTED_CACHE = new Map<string, string>();

/** يستخرج YAML frontmatter البسيط (قيم نصّيّة فقط) بدون تبعيّة. */
function parseFrontmatter(raw: string): Record<string, string> {
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!m) return {};
  const out: Record<string, string> = {};
  const body = m[1];
  // مفاتيح من المستوى الأوّل فقط (نتجاهل nested metadata بأمان).
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    // نتخطّى الأسطر المُسنّنة (nested) والتعليقات والفراغات.
    if (!line || /^\s/.test(line) || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // إزالة علامات الاقتباس المحيطة.
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

/** يستخرج أوّل فقرة مفيدة من جسم الـ markdown بعد frontmatter. */
function extractSummary(body: string): string {
  // نُسقط frontmatter إذا وُجد.
  const noFm = body.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/, '');
  // نأخذ أوّل ~600 حرف بعد تنظيف العناوين البارزة.
  const cleaned = noFm
    .replace(/^#{1,6}\s+.+$/gm, (h) => h.replace(/^#+\s+/, '')) // إبقاء عنوان واحد
    .replace(/```[\s\S]*?```/g, '') // إزالة كتل الكود
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned.slice(0, MAX_CHARS_PER_SKILL);
}

/** يقرأ ملفّ SKILL.md ويُنتج التمثيل المُحلَّل (مع ذاكرة مؤقّتة). */
function readSkill(relPath: string): ParsedSkill | null {
  if (PARSE_CACHE.has(relPath)) return PARSE_CACHE.get(relPath)!;
  const abs = path.join(SKILLS_ROOT, relPath);
  if (!existsSync(abs)) {
    PARSE_CACHE.set(relPath, null);
    return null;
  }
  try {
    const raw = readFileSync(abs, 'utf8');
    const fm = parseFrontmatter(raw);
    const name = fm.name || path.basename(path.dirname(relPath));
    const description = fm.description || '';
    if (!description) {
      // لا فائدة من حقن مهارة بدون وصف.
      PARSE_CACHE.set(relPath, null);
      return null;
    }
    const summary = extractSummary(raw);
    const parsed: ParsedSkill = { name, description, summary };
    PARSE_CACHE.set(relPath, parsed);
    return parsed;
  } catch {
    PARSE_CACHE.set(relPath, null);
    return null;
  }
}

/**
 * يُرجع نصّاً عربيّاً منسّقاً يُلخّص المهارات البذريّة لوكيل معيّن،
 * أو سلسلة فارغة إذا لم تكن هناك مهارات مُسجّلة (أو لم يُعثر عليها).
 *
 * يُحقن في system prompt تلقائيّاً عبر `instrumentAgent`.
 */
export function getBootstrapSkillsAddon(agentName: string): string {
  if (FORMATTED_CACHE.has(agentName)) return FORMATTED_CACHE.get(agentName)!;
  const paths = getRegisteredSkillPaths(agentName);
  if (paths.length === 0) {
    FORMATTED_CACHE.set(agentName, '');
    return '';
  }
  const parsed = paths.map(readSkill).filter((s): s is ParsedSkill => !!s);
  if (parsed.length === 0) {
    FORMATTED_CACHE.set(agentName, '');
    return '';
  }
  const lines: string[] = [
    '──────────────  مهارات الخبرة المُتاحة لك  ──────────────',
    'تمتلك المهارات التاليّة كخلفيّة معرفيّة. استخدم الإطار الأنسب منها',
    'بصمت — لا تذكر أسماء المهارات للمستخدم، فقط طبّق فكرها في إجابتك.',
    '',
  ];
  for (const s of parsed) {
    lines.push(`• ${s.name} — ${s.description}`);
    if (s.summary) {
      lines.push(`  مرجع موجز: ${s.summary.replace(/\n+/g, ' ').slice(0, 280)}`);
    }
  }
  lines.push('────────────────────────────────────────────────────────');
  const text = lines.join('\n');
  FORMATTED_CACHE.set(agentName, text);
  return text;
}

/** يفرغ الذاكرة المؤقّتة — مفيد للاختبار أو لإعادة تحميل ساخن. */
export function clearSkillsCache(): void {
  PARSE_CACHE.clear();
  FORMATTED_CACHE.clear();
}

/** يُرجع قائمة المهارات المُسجّلة لكلّ الوكلاء (للتشخيص/اللوحة). */
export function listLoadedSkillsForAgent(agentName: string): ParsedSkill[] {
  const paths = getRegisteredSkillPaths(agentName);
  return paths.map(readSkill).filter((s): s is ParsedSkill => !!s);
}

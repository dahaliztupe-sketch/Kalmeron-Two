import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import type { AuditFinding, BenchmarkContext } from '../types';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

interface BenchmarkCheck {
  id: string;
  competitor: string;
  competitorUrl: string;
  feature: string;
  description: string;
  test: () => boolean;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  fix: string;
  category: string;
  references?: string[];
}

/**
 * Benchmark Module — يقارن مشروعنا بأفضل المنصات العالمية.
 * كل check يمثل ميزة عند منصة احترافية ويسأل: "هل عندنا نفس الشيء؟"
 *
 * المصادر المرجعية:
 * - Vercel  (https://vercel.com)        — Next.js best-in-class
 * - Linear  (https://linear.app)        — معيار سرعة + UX
 * - Stripe  (https://stripe.com)        — معيار docs + DX
 * - Notion  (https://notion.so)         — معيار رحلة المستخدم
 * - Anthropic Claude (https://claude.ai) — معيار AI products
 * - OpenAI ChatGPT (https://chatgpt.com) — AI conversational UX
 * - Cursor  (https://cursor.sh)         — AI agents UX
 * - Resend  (https://resend.com)        — modern Stripe-like docs
 */
export async function auditBenchmarks(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  const pkg = existsSync('package.json')
    ? JSON.parse(readFileSync('package.json', 'utf8'))
    : { dependencies: {}, devDependencies: {}, scripts: {} };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const scripts = pkg.scripts ?? {};

  const has = (file: string) => existsSync(file);
  const hasAny = (files: string[]) => files.some(existsSync);
  const grep = (pattern: string, paths = 'app components src') => {
    const out = safeExec(`rg -l "${pattern}" ${paths} 2>/dev/null`);
    return out.split('\n').filter(Boolean).length > 0;
  };

  const checks: BenchmarkCheck[] = [
    // ── Vercel / Next.js gold standard ──
    {
      id: 'BENCH-VERCEL-EDGE',
      competitor: 'Vercel',
      competitorUrl: 'https://vercel.com',
      feature: 'Edge Runtime للمسارات الحساسة',
      description: 'Vercel/Next.js يستخدم Edge Runtime لـ middleware و auth — استجابة < 50ms عالمياً',
      test: () => grep('runtime.*edge|export const runtime', 'app proxy.ts middleware.ts'),
      severity: 'medium',
      fix: 'أضف export const runtime = "edge" في proxy.ts و routes حساسة للسرعة',
      category: 'الأداء',
    },
    {
      id: 'BENCH-VERCEL-ISR',
      competitor: 'Vercel',
      competitorUrl: 'https://vercel.com',
      feature: 'ISR / revalidate للصفحات العامة',
      description: 'Vercel docs تستخدم revalidate للحفاظ على السرعة + المحتوى المحدّث',
      test: () => grep('revalidate|unstable_cache|cache:.*force-cache', 'app'),
      severity: 'medium',
      fix: 'أضف export const revalidate = 3600 للصفحات العامة (blog, pricing, docs)',
      category: 'الأداء',
    },
    {
      id: 'BENCH-VERCEL-OG',
      competitor: 'Vercel',
      competitorUrl: 'https://vercel.com',
      feature: 'Dynamic OG images عبر @vercel/og',
      description: 'كل مقال/صفحة على Vercel/Linear له صورة OG ديناميكية مع العنوان',
      test: () => grep('ImageResponse|@vercel/og', 'app'),
      severity: 'low',
      fix: 'أنشئ app/opengraph-image.tsx يستخدم ImageResponse من next/og',
      category: 'التسويق',
      references: ['https://vercel.com/docs/functions/og-image-generation'],
    },

    // ── Linear — speed + keyboard UX ──
    {
      id: 'BENCH-LINEAR-CMDK',
      competitor: 'Linear',
      competitorUrl: 'https://linear.app',
      feature: 'Command Menu (Cmd+K)',
      description: 'Linear بنى عليها — تنقّل فوري بدون فأرة. كل SaaS احترافي عنده',
      test: () => grep('cmdk|CommandMenu|CommandPalette|Cmd\\+K|⌘K', 'app components'),
      severity: 'high',
      fix: 'npm i cmdk، أنشئ components/CommandMenu.tsx وافتحها بـ Cmd/Ctrl+K',
      category: 'تجربة المستخدم',
      references: ['https://github.com/pacocoursey/cmdk'],
    },
    {
      id: 'BENCH-LINEAR-SHORTCUTS',
      competitor: 'Linear',
      competitorUrl: 'https://linear.app',
      feature: 'اختصارات لوحة المفاتيح + Help (?)',
      description: 'Linear: g+i = inbox، g+m = my issues. عرض الاختصارات بضغط ?',
      test: () => grep('keydown|hotkey|useHotkeys|keyboard.*shortcut', 'app components'),
      severity: 'medium',
      fix: 'استخدم react-hotkeys-hook، اعرض cheatsheet للاختصارات في modal',
      category: 'تجربة المستخدم',
    },
    {
      id: 'BENCH-LINEAR-OPTIMISTIC',
      competitor: 'Linear',
      competitorUrl: 'https://linear.app',
      feature: 'Optimistic UI updates',
      description: 'Linear يبدو فوري لأن كل تغيير يظهر قبل تأكيد الخادم',
      test: () => grep('optimistic|onMutate|useOptimistic', 'app components hooks'),
      severity: 'medium',
      fix: 'استخدم React 19 useOptimistic أو React Query onMutate لكل mutation',
      category: 'تجربة المستخدم',
    },

    // ── Stripe — docs + DX ──
    {
      id: 'BENCH-STRIPE-DOCS',
      competitor: 'Stripe',
      competitorUrl: 'https://stripe.com/docs',
      feature: 'وثائق API كاملة (/docs)',
      description: 'Stripe docs = معيار الصناعة. كل endpoint موثّق مع code samples',
      test: () => has('app/docs/page.tsx') || has('public/api-docs/index.html'),
      severity: 'medium',
      fix: 'أنشئ /docs مع OpenAPI spec + Mintlify أو Nextra أو Fumadocs',
      category: 'الوثائق',
      references: ['https://www.fumadocs.dev/'],
    },
    {
      id: 'BENCH-STRIPE-CHANGELOG',
      competitor: 'Stripe',
      competitorUrl: 'https://stripe.com/blog/changelog',
      feature: 'صفحة /changelog عامة',
      description: 'Stripe ينشر كل API change علناً — يبني ثقة المطورين',
      test: () => hasAny(['app/changelog/page.tsx', 'app/(marketing)/changelog/page.tsx']),
      severity: 'low',
      fix: 'أنشئ /changelog يقرأ من CHANGELOG.md ويعرضه HTML',
      category: 'الوثائق',
    },
    {
      id: 'BENCH-STRIPE-STATUS',
      competitor: 'Stripe',
      competitorUrl: 'https://status.stripe.com',
      feature: 'صفحة Status / Uptime عامة',
      description: 'كل SaaS احترافي يعرض uptime علناً (status.stripe.com / status.linear.app)',
      test: () => hasAny(['app/status/page.tsx', 'app/(marketing)/status/page.tsx']) ||
        grep('statuspage|betterstack', '.'),
      severity: 'medium',
      fix: 'استخدم BetterStack/Statuspage أو ابنِ /status من /api/health endpoints',
      category: 'الموثوقية',
    },

    // ── Notion / Anthropic — onboarding ──
    {
      id: 'BENCH-NOTION-ONBOARDING',
      competitor: 'Notion',
      competitorUrl: 'https://notion.so',
      feature: 'Onboarding تفاعلي (5+ خطوات)',
      description: 'Notion/Linear/ChatGPT يأخذونك في رحلة قبل الاستخدام',
      test: () => has('app/onboarding') || has('app/(dashboard)/onboarding') ||
        grep('OnboardingWizard|onboardingStep', 'components app'),
      severity: 'high',
      fix: 'أنشئ wizard من 5 خطوات مع progress bar + skip + استكمال لاحقاً',
      category: 'تجربة المستخدم',
    },
    {
      id: 'BENCH-NOTION-EMPTY-STATES',
      competitor: 'Notion',
      competitorUrl: 'https://notion.so',
      feature: 'Empty states ثرية (illustrations + CTAs)',
      description: 'Notion يحوّل كل قائمة فارغة لـ "ابدأ هنا" مع رسم وزر',
      test: () => grep('EmptyState|empty-state|لا توجد|لا يوجد', 'components'),
      severity: 'medium',
      fix: 'أنشئ components/EmptyState.tsx مع illustration + رسالة + CTA',
      category: 'تجربة المستخدم',
    },

    // ── Anthropic / OpenAI — AI UX ──
    {
      id: 'BENCH-CLAUDE-STREAMING',
      competitor: 'Anthropic',
      competitorUrl: 'https://claude.ai',
      feature: 'Streaming responses للـ AI',
      description: 'Claude/ChatGPT يرسلون النص حرفاً حرفاً — تجربة فورية',
      test: () => grep('stream:.*true|streamText|toDataStream|StreamingTextResponse', 'app/api'),
      severity: 'high',
      fix: 'استخدم streamText من ai package + useChat hook في الـ frontend',
      category: 'تجربة AI',
      references: ['https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot'],
    },
    {
      id: 'BENCH-CLAUDE-STOP',
      competitor: 'Anthropic',
      competitorUrl: 'https://claude.ai',
      feature: 'إيقاف الإجابة (Stop generating)',
      description: 'Claude/ChatGPT يسمحون للمستخدم إيقاف الإجابة في أي لحظة',
      test: () => grep('AbortController|abortSignal|stopGenerating|stop\\(\\)', 'app components'),
      severity: 'medium',
      fix: 'مرّر AbortController.signal لكل fetch + زر "إيقاف" في الـ UI',
      category: 'تجربة AI',
    },
    {
      id: 'BENCH-CLAUDE-REGEN',
      competitor: 'Anthropic',
      competitorUrl: 'https://claude.ai',
      feature: 'إعادة توليد الإجابة (Regenerate)',
      description: 'كل دردشة AI احترافية فيها زر "أعد المحاولة" لكل إجابة',
      test: () => grep('regenerate|reload\\(|tryAgain', 'app components'),
      severity: 'medium',
      fix: 'استخدم reload() من useChat + زر "🔄 أعد"',
      category: 'تجربة AI',
    },
    {
      id: 'BENCH-CLAUDE-FEEDBACK',
      competitor: 'Anthropic',
      competitorUrl: 'https://claude.ai',
      feature: 'تقييم الإجابة (👍/👎)',
      description: 'Claude/ChatGPT يجمعون feedback لتحسين النموذج — حيوي للـ evals',
      test: () => grep('thumbs|feedback.*ai|rateResponse|messageRating', 'app components'),
      severity: 'medium',
      fix: 'أضف 👍/👎 تحت كل رسالة AI واحفظها في Firestore + Langfuse',
      category: 'تجربة AI',
    },
    {
      id: 'BENCH-CHATGPT-COPY',
      competitor: 'OpenAI ChatGPT',
      competitorUrl: 'https://chatgpt.com',
      feature: 'نسخ كود / إجابة بنقرة',
      description: 'كل ChatGPT response له زر نسخ — أساس في AI products',
      test: () => grep('navigator\\.clipboard|copyToClipboard|copy.*message', 'components app'),
      severity: 'low',
      fix: 'أضف زر "📋 نسخ" تحت كل code block + رسالة AI',
      category: 'تجربة AI',
    },
    {
      id: 'BENCH-CHATGPT-HISTORY',
      competitor: 'OpenAI ChatGPT',
      competitorUrl: 'https://chatgpt.com',
      feature: 'سجل المحادثات (Conversation history)',
      description: 'كل محادثة تُحفظ ويمكن العودة لها — أساسي في chat products',
      test: () => grep('conversations|chat.*history|threadId|sessions.*chat', 'app/api src'),
      severity: 'high',
      fix: 'احفظ كل محادثة في Firestore: conversations/{id} مع title + messages',
      category: 'تجربة AI',
    },

    // ── Cursor / agentic ──
    {
      id: 'BENCH-CURSOR-AGENTS',
      competitor: 'Cursor',
      competitorUrl: 'https://cursor.sh',
      feature: 'Agent mode (متعدد الخطوات + tools)',
      description: 'Cursor agents يستخدمون tools متعددة. كلميرون عنده 16 وكيل لكن هل multi-step؟',
      test: () => grep('tool\\(|tools:.*\\[|toolChoice|max_steps|maxSteps', 'app/api src'),
      severity: 'high',
      fix: 'استخدم Vercel AI SDK tools + maxSteps لتمكين الوكلاء من تنفيذ خطوات متتالية',
      category: 'تجربة AI',
      references: ['https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling'],
    },

    // ── Resend / modern marketing ──
    {
      id: 'BENCH-RESEND-EMAIL',
      competitor: 'Resend',
      competitorUrl: 'https://resend.com',
      feature: 'إيميلات منتجة بـ React Email',
      description: 'Resend ينتج كل إيميل من React component — يضمن RTL + برمجياً',
      test: () => grep('@react-email|react-email', 'package.json src components'),
      severity: 'low',
      fix: 'npm i @react-email/components وأنشئ emails/ folder',
      category: 'الإيميل',
    },

    // ── Internationalization ──
    {
      id: 'BENCH-INTL-LOCALE-DETECT',
      competitor: 'Stripe',
      competitorUrl: 'https://stripe.com',
      feature: 'كشف لغة المتصفح + suggestion',
      description: 'Stripe/Notion يكتشفون لغة المتصفح ويقترحون التبديل',
      test: () => grep('Accept-Language|navigator\\.language|locale.*detect', 'app proxy.ts middleware.ts'),
      severity: 'low',
      fix: 'في proxy.ts: اقرأ Accept-Language واقترح اللغة المناسبة',
      category: 'i18n',
    },

    // ── DX / Developer experience ──
    {
      id: 'BENCH-VERCEL-PREVIEW',
      competitor: 'Vercel',
      competitorUrl: 'https://vercel.com',
      feature: 'Preview deployments لكل PR',
      description: 'كل PR على Vercel يحصل على URL منفصل للمراجعة',
      test: () => existsSync('vercel.json') || existsSync('.vercel') ||
        existsSync('netlify.toml') || existsSync('firebase.json'),
      severity: 'low',
      fix: 'فعّل Vercel preview deployments أو Netlify deploy previews',
      category: 'DX',
    },

    // ── Security baseline ──
    {
      id: 'BENCH-STRIPE-2FA',
      competitor: 'Stripe',
      competitorUrl: 'https://stripe.com',
      feature: 'مصادقة ثنائية (2FA / MFA)',
      description: 'Stripe/Linear/GitHub يفرضون 2FA على الحسابات الحساسة',
      test: () => grep('totp|otp|2fa|mfa|multiFactor|enroll.*factor', 'app src'),
      severity: 'high',
      fix: 'استخدم Firebase MultiFactor + TOTP (Google Authenticator)',
      category: 'الأمان',
      references: ['https://firebase.google.com/docs/auth/web/totp-mfa'],
    },
    {
      id: 'BENCH-STRIPE-AUDIT-LOG',
      competitor: 'Stripe',
      competitorUrl: 'https://stripe.com',
      feature: 'Audit log للحساب (من فعل ماذا متى)',
      description: 'Stripe/Linear يحتفظون بسجل لكل عملية حساسة (login, billing change)',
      test: () => grep('auditLog|audit_log|activity.*log', 'app/api src'),
      severity: 'medium',
      fix: 'أنشئ Firestore collection: auditLogs/{userId} يسجل كل عملية حساسة',
      category: 'الأمان',
    },

    // ── Feature flags ──
    {
      id: 'BENCH-VERCEL-FLAGS',
      competitor: 'Vercel',
      competitorUrl: 'https://vercel.com',
      feature: 'Feature flags',
      description: 'Vercel/Linear يستخدمون flags لإطلاق ميزات تدريجياً + A/B test',
      test: () => grep('featureFlag|FlagsmithProvider|launchdarkly|@vercel/flags', 'app src'),
      severity: 'low',
      fix: 'استخدم @vercel/flags أو statsig أو edge-config لـ flags',
      category: 'DX',
    },

    // ── Performance budget ──
    {
      id: 'BENCH-PERF-BUDGET',
      competitor: 'Vercel',
      competitorUrl: 'https://vercel.com',
      feature: 'Performance budget في CI',
      description: 'Vercel يفرض حد أقصى لحجم bundle — يمنع تراجع الأداء',
      test: () => existsSync('.lighthouserc.json') || existsSync('.size-limit.json') ||
        !!deps['@size-limit/preset-app'] || !!deps['size-limit'],
      severity: 'medium',
      fix: 'أضف .size-limit.json أو bundlewatch + job في CI',
      category: 'الأداء',
    },

    // ── SaaS billing / metering ──
    {
      id: 'BENCH-OPENAI-USAGE',
      competitor: 'OpenAI',
      competitorUrl: 'https://platform.openai.com',
      feature: 'لوحة استخدام (Usage dashboard)',
      description: 'OpenAI/Anthropic يعرضون كم استهلكت + breakdown يومي/شهري',
      test: () => hasAny(['app/(dashboard)/usage/page.tsx', 'app/dashboard/usage/page.tsx']) ||
        grep('UsageDashboard|usage.*chart', 'components'),
      severity: 'medium',
      fix: 'أنشئ /dashboard/usage يعرض tokens, $, agents بـ recharts',
      category: 'الأعمال',
    },

    // ── Email transactional ──
    {
      id: 'BENCH-LINEAR-EMAIL-NOTIF',
      competitor: 'Linear',
      competitorUrl: 'https://linear.app',
      feature: 'إيميلات معاملات (welcome, receipt, alerts)',
      description: 'كل SaaS احترافي يرسل: welcome, password reset, receipt, billing alerts',
      test: () => grep('sendEmail|sendgrid|resend\\.emails|nodemailer', 'app/api src services'),
      severity: 'medium',
      fix: 'استخدم Resend/SendGrid + قوالب React Email للأنواع الأساسية',
      category: 'التواصل',
    },

    // ── Discoverability ──
    {
      id: 'BENCH-LINEAR-LOAD-MORE',
      competitor: 'Linear',
      competitorUrl: 'https://linear.app',
      feature: 'Infinite scroll / pagination في القوائم',
      description: 'القوائم الطويلة تحتاج تحميل تدريجي — تأخير الـ render يقتل الأداء',
      test: () => grep('useInfiniteQuery|infinite.*scroll|loadMore|cursor.*pagin', 'app components'),
      severity: 'low',
      fix: 'استخدم React Query useInfiniteQuery + Firestore startAfter',
      category: 'الأداء',
    },
  ];

  // Run all checks
  for (const check of checks) {
    let passes = false;
    try {
      passes = check.test();
    } catch {
      passes = false;
    }

    if (!passes) {
      const benchmark: BenchmarkContext = {
        competitor: check.competitor,
        competitorUrl: check.competitorUrl,
        theyHave: check.feature,
        weHave: 'غير موجود',
        gap: 'missing',
        impact: check.severity === 'critical' || check.severity === 'high' ? 'high' :
          check.severity === 'medium' ? 'medium' : 'low',
      };

      findings.push({
        id: check.id,
        category: 'benchmarks',
        severity: check.severity,
        title: `${check.competitor}: ${check.feature}`,
        description: check.description,
        fix: check.fix,
        autoFixable: false,
        references: check.references ?? [check.competitorUrl],
        benchmark,
      });
    }
  }

  return findings;
}

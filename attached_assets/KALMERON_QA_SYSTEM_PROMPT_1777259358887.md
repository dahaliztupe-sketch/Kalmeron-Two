# KALMERON — AUTONOMOUS QA SYSTEM PROMPT
# نظام فحص وإصلاح تلقائي شامل — يحاكي مستخدمين حقيقيين من 5 أجهزة مختلفة

---

أنت مهندس QA أول ومهندس أمامي خبير. مهمتك بناء نظام فحص ذاتي كامل لمنصة Kalmeron Two يعمل تلقائياً ويكتشف الأخطاء قبل أن يراها المستخدم. النظام يجب أن يحاكي تجربة مستخدمين حقيقيين على 5 أجهزة مختلفة.

---

## الخطوة 0 — فهم الأجهزة المستهدفة

النظام يجب أن يحاكي هذه الأجهزة بدقة:

```typescript
export const DEVICES = {
  desktop_wide: { width: 1440, height: 900,  ua: 'Chrome/Desktop',    label: 'ديسكتوب واسع' },
  desktop_std:  { width: 1280, height: 800,  ua: 'Chrome/Desktop',    label: 'ديسكتوب عادي' },
  ipad:         { width: 768,  height: 1024, ua: 'Safari/iPad',       label: 'آيباد' },
  android:      { width: 390,  height: 844,  ua: 'Chrome/Android',    label: 'هاتف أندرويد' },
  iphone:       { width: 375,  height: 812,  ua: 'Safari/iPhone',     label: 'آيفون' },
} as const;

export type DeviceKey = keyof typeof DEVICES;
```

---

## الخطوة 1 — إنشاء البنية الكاملة للنظام

أنشئ هذه الملفات:

```
qa/
├── index.ts                    ← نقطة دخول النظام
├── config.ts                   ← الإعدادات
├── types.ts                    ← تعريفات TypeScript
├── runner.ts                   ← منسّق تشغيل الفحوصات
├── reporter.ts                 ← مولّد التقارير
├── devices.ts                  ← تعريفات الأجهزة
│
├── checkers/
│   ├── layout.checker.ts       ← فحص التخطيط والخطوط الخارجة
│   ├── content.checker.ts      ← فحص المحتوى والكلمات
│   ├── performance.checker.ts  ← فحص سرعة التحميل
│   ├── auth.checker.ts         ← فحص المصادقة والتوجيه
│   ├── agents.checker.ts       ← فحص الـ 16 وكيل
│   ├── links.checker.ts        ← فحص الروابط المكسورة
│   ├── seo.checker.ts          ← فحص SEO والـ metadata
│   └── rtl.checker.ts          ← فحص RTL والعربية
│
├── fixers/
│   ├── layout.fixer.ts         ← إصلاح تلقائي لمشاكل التخطيط
│   ├── content.fixer.ts        ← إصلاح تلقائي للمحتوى
│   └── links.fixer.ts          ← إصلاح تلقائي للروابط
│
└── reports/
    └── .gitkeep
```

---

## الخطوة 2 — تعريفات TypeScript الأساسية (qa/types.ts)

```typescript
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type CheckStatus = 'pass' | 'fail' | 'warning' | 'skip';
export type FixStatus = 'fixed' | 'partial' | 'manual_required' | 'not_applicable';

export interface Device {
  width: number;
  height: number;
  ua: string;
  label: string;
}

export interface CheckResult {
  id: string;
  name: string;
  page: string;
  device: string;
  status: CheckStatus;
  severity: Severity;
  message: string;
  details?: string;
  selector?: string;
  screenshot?: string;        // base64 للصورة إن وجدت
  autoFixable: boolean;
  fixApplied?: boolean;
  fixStatus?: FixStatus;
  duration: number;           // بالمللي ثانية
  timestamp: string;
}

export interface PageReport {
  url: string;
  device: string;
  loadTimeMs: number;
  checks: CheckResult[];
  passed: number;
  failed: number;
  warnings: number;
  criticalCount: number;
}

export interface QAReport {
  runId: string;
  timestamp: string;
  baseUrl: string;
  totalPages: number;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalIssues: CheckResult[];
  autoFixed: number;
  manualRequired: CheckResult[];
  pageReports: PageReport[];
  summary: string;
  score: number;              // 0-100
}
```

---

## الخطوة 3 — الفاحص الأول: التخطيط (qa/checkers/layout.checker.ts)

هذا الفاحص يكتشف الخطوط الخارجة من الشاشة، العناصر المتداخلة، والعناصر المقطوعة:

```typescript
import type { CheckResult, Device } from '../types';

export async function checkLayout(
  page: any, // Playwright page
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  // 1. كشف العناصر الخارجة من حدود الشاشة (overflow)
  const overflowIssues = await page.evaluate((deviceWidth: number) => {
    const issues: { selector: string; details: string }[] = [];
    const all = document.querySelectorAll('*');

    all.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      
      // عنصر يخرج من اليمين
      if (rect.right > deviceWidth + 2) {
        const selector = el.tagName.toLowerCase() +
          (el.id ? `#${el.id}` : '') +
          (el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).slice(0,2).join('.')}`
            : '');
        issues.push({
          selector,
          details: `يخرج ${Math.round(rect.right - deviceWidth)}px من اليمين`
        });
      }
      
      // نص يخرج من حاويته
      if (style.overflow === 'visible' && el.scrollWidth > el.clientWidth + 2) {
        issues.push({
          selector: el.tagName.toLowerCase(),
          details: `نص يتجاوز عرض الحاوية بـ ${el.scrollWidth - el.clientWidth}px`
        });
      }
    });
    
    return issues.slice(0, 20); // أقصى 20 مشكلة لتجنب الإغراق
  }, device.width);

  for (const issue of overflowIssues) {
    results.push({
      id: `layout_overflow_${Date.now()}`,
      name: 'عنصر يخرج من الشاشة',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `عنصر "${issue.selector}" يخرج من حدود الشاشة`,
      details: issue.details,
      selector: issue.selector,
      autoFixable: true,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 2. كشف النصوص المتداخلة
  const overlappingTexts = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,label'));
    const issues: string[] = [];
    
    for (let i = 0; i < texts.length - 1; i++) {
      const r1 = texts[i].getBoundingClientRect();
      const r2 = texts[i + 1].getBoundingClientRect();
      
      if (r1.width === 0 || r1.height === 0) continue;
      if (r2.width === 0 || r2.height === 0) continue;
      
      const overlap = !(r1.right <= r2.left || r2.right <= r1.left ||
                        r1.bottom <= r2.top || r2.bottom <= r1.top);
      
      if (overlap && r1.top !== r2.top) {
        issues.push(
          `"${texts[i].textContent?.slice(0,20)}" و "${texts[i+1].textContent?.slice(0,20)}"`
        );
      }
    }
    return issues.slice(0, 5);
  });

  for (const issue of overlappingTexts) {
    results.push({
      id: `layout_overlap_${Date.now()}`,
      name: 'نصوص متداخلة',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `نصوص متداخلة: ${issue}`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 3. كشف الصور المقطوعة أو المكسورة
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src || img.getAttribute('src') || 'unknown');
  });

  for (const src of brokenImages) {
    results.push({
      id: `layout_broken_img_${Date.now()}`,
      name: 'صورة مكسورة',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'medium',
      message: `صورة لا تُحمَّل: ${src.slice(-60)}`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 4. كشف أزرار صغيرة جداً (مشكلة على الهاتف)
  if (device.width <= 430) {
    const smallTouchTargets = await page.evaluate(() => {
      const clickable = document.querySelectorAll('button, a, [role="button"], input[type="submit"]');
      const issues: string[] = [];
      clickable.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height < 44) {
          issues.push(
            `"${el.textContent?.trim().slice(0,20) || el.tagName}" — ارتفاع ${Math.round(rect.height)}px (الحد الأدنى 44px)`
          );
        }
      });
      return issues.slice(0, 10);
    });

    for (const issue of smallTouchTargets) {
      results.push({
        id: `layout_touch_${Date.now()}`,
        name: 'هدف لمس صغير جداً',
        page: url,
        device: device.label,
        status: 'warning',
        severity: 'medium',
        message: `زر أو رابط صغير على الهاتف: ${issue}`,
        autoFixable: true,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 5. كشف مشاكل Scroll الأفقي
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
  });

  if (hasHorizontalScroll) {
    results.push({
      id: `layout_hscroll_${Date.now()}`,
      name: 'تمرير أفقي غير مقصود',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `الصفحة تحتوي على تمرير أفقي — يدمر تجربة المستخدم على الهاتف`,
      autoFixable: true,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  return results;
}
```

---

## الخطوة 4 — فاحص المحتوى (qa/checkers/content.checker.ts)

يكشف الكلمات غير المناسبة، النصوص placeholder، والمحتوى الإنجليزي الخاطئ:

```typescript
import type { CheckResult, Device } from '../types';

// كلمات يجب مراجعتها قبل الإطلاق
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /\[placeholder\]/i,
  /\[اسم الشركة\]/i,
  /\[ادخل/i,
  /TODO:/,
  /FIXME:/,
  /coming soon/i,
  /قريباً/,
  /تحت الإنشاء/,
  /under construction/i,
  /test@test\.com/i,
  /example\.com/i,
];

// كلمات إنجليزية يجب أن تكون عربية في الواجهة
const EXPECTED_ARABIC_CONTEXTS = [
  { pattern: /Sign in/i, page: '/auth/login', expected: 'تسجيل الدخول' },
  { pattern: /Sign up/i, page: '/auth/signup', expected: 'التسجيل' },
  { pattern: /Dashboard/i, page: '/dashboard', expected: 'لوحة التحكم' },
];

// كلمات محظورة تماماً
const BANNED_WORDS = [
  'كلمة_محظورة_1',
  'كلمة_محظورة_2',
  // أضف كلماتك المحظورة هنا
];

export async function checkContent(
  page: any,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  const pageText = await page.evaluate(() => document.body.innerText);

  // 1. كشف النصوص placeholder
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(pageText)) {
      results.push({
        id: `content_placeholder_${Date.now()}`,
        name: 'نص placeholder غير مُستبدَل',
        page: url,
        device: device.label,
        status: 'fail',
        severity: 'high',
        message: `وُجد نص placeholder: "${pattern.source}" في الصفحة`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 2. كشف الكلمات المحظورة
  for (const word of BANNED_WORDS) {
    if (pageText.includes(word)) {
      results.push({
        id: `content_banned_${Date.now()}`,
        name: 'كلمة غير مناسبة',
        page: url,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `وُجدت كلمة محظورة في الصفحة`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 3. كشف الأسعار غير المنسقة (أرقام بدون عملة)
  const pricePatterns = await page.evaluate(() => {
    const text = document.body.innerText;
    const issues: string[] = [];
    const badPrices = text.match(/\b\d{2,5}(?:\.\d{2})?\s*(?!جنيه|\$|USD|EGP|دولار|ريال)/g);
    if (badPrices && badPrices.length > 3) {
      issues.push(`${badPrices.length} رقم بدون عملة واضحة`);
    }
    return issues;
  });

  for (const issue of pricePatterns) {
    results.push({
      id: `content_price_${Date.now()}`,
      name: 'سعر بدون عملة',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'low',
      message: issue,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 4. تحقق من وجود نص فعلي (ليس فارغاً)
  const isEmpty = pageText.trim().length < 50;
  if (isEmpty) {
    results.push({
      id: `content_empty_${Date.now()}`,
      name: 'صفحة فارغة أو بدون محتوى',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `الصفحة لا تحتوي على محتوى كافٍ (أقل من 50 حرف)`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 5. كشف "undefined" أو "null" ظاهر في الـ UI
  const hasUndefined = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('undefined') || text.includes('[object Object]');
  });

  if (hasUndefined) {
    results.push({
      id: `content_undefined_${Date.now()}`,
      name: 'قيمة undefined ظاهرة للمستخدم',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `الصفحة تعرض "undefined" أو "[object Object]" للمستخدم — خطأ برمجي`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  return results;
}
```

---

## الخطوة 5 — فاحص الأداء (qa/checkers/performance.checker.ts)

يقيس سرعة التحميل الحقيقية:

```typescript
import type { CheckResult, Device } from '../types';

// الحدود الزمنية المقبولة بالمللي ثانية
const THRESHOLDS = {
  lcp: { good: 2500, acceptable: 4000 },         // Largest Contentful Paint
  fcp: { good: 1800, acceptable: 3000 },         // First Contentful Paint
  totalLoad: { good: 3000, acceptable: 5000 },   // إجمالي وقت التحميل
  ttfb: { good: 200, acceptable: 600 },          // Time to First Byte
  apiResponse: { good: 1000, acceptable: 3000 }, // ردود الـ API
};

export async function checkPerformance(
  page: any,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  // 1. قياس مؤشرات الأداء الأساسية
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime ?? 0;

    return {
      ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
      totalLoad: nav ? Math.round(nav.loadEventEnd) : 0,
      fcp: Math.round(fcp),
      resourceCount: performance.getEntriesByType('resource').length,
      totalTransferSize: performance.getEntriesByType('resource')
        .reduce((sum, r: any) => sum + (r.transferSize || 0), 0),
    };
  });

  // تحليل TTFB
  if (metrics.ttfb > THRESHOLDS.ttfb.acceptable) {
    results.push({
      id: `perf_ttfb_${Date.now()}`,
      name: 'TTFB بطيء',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `Time to First Byte: ${metrics.ttfb}ms (الحد المقبول: ${THRESHOLDS.ttfb.acceptable}ms)`,
      details: 'قد يكون بسبب بطء Vercel Edge Function أو Firebase queries',
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // تحليل FCP
  if (metrics.fcp > THRESHOLDS.fcp.acceptable) {
    results.push({
      id: `perf_fcp_${Date.now()}`,
      name: 'FCP بطيء — تحميل أولي ثقيل',
      page: url,
      device: device.label,
      status: metrics.fcp > THRESHOLDS.fcp.acceptable ? 'fail' : 'warning',
      severity: metrics.fcp > THRESHOLDS.fcp.acceptable ? 'high' : 'medium',
      message: `First Contentful Paint: ${metrics.fcp}ms`,
      details: `الهدف: < ${THRESHOLDS.fcp.good}ms. تحقق من: حجم الـ bundle، الصور غير المُحسَّنة، JavaScript blocking`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // تحليل إجمالي وقت التحميل
  if (metrics.totalLoad > THRESHOLDS.totalLoad.good) {
    results.push({
      id: `perf_load_${Date.now()}`,
      name: 'تحميل الصفحة بطيء',
      page: url,
      device: device.label,
      status: metrics.totalLoad > THRESHOLDS.totalLoad.acceptable ? 'fail' : 'warning',
      severity: metrics.totalLoad > THRESHOLDS.totalLoad.acceptable ? 'high' : 'medium',
      message: `وقت التحميل الكامل: ${metrics.totalLoad}ms`,
      details: `الهدف: < ${THRESHOLDS.totalLoad.good}ms. الموارد المحمَّلة: ${metrics.resourceCount}`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // كشف حجم النقل الكبير
  const transferMB = (metrics.totalTransferSize / 1024 / 1024).toFixed(2);
  if (metrics.totalTransferSize > 3 * 1024 * 1024) { // أكثر من 3MB
    results.push({
      id: `perf_size_${Date.now()}`,
      name: 'حجم الصفحة كبير جداً',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'medium',
      message: `إجمالي حجم التحميل: ${transferMB}MB (الموصى به: < 1MB)`,
      details: 'تحقق من الصور وحجم الـ JavaScript bundle',
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 2. كشف موارد بطيئة (API calls > 3 ثواني)
  const slowResources = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .filter((r: any) => r.duration > 3000)
      .map((r: any) => ({
        url: r.name.replace(location.origin, ''),
        duration: Math.round(r.duration)
      }))
      .slice(0, 5);
  });

  for (const resource of slowResources) {
    results.push({
      id: `perf_slow_resource_${Date.now()}`,
      name: 'مورد بطيء جداً',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'medium',
      message: `"${resource.url}" استغرق ${resource.duration}ms`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  return results;
}
```

---

## الخطوة 6 — فاحص المصادقة والتوجيه (qa/checkers/auth.checker.ts)

يختبر كل سيناريوهات تسجيل الدخول والخروج:

```typescript
import type { CheckResult, Device } from '../types';

// الصفحات المحمية — يجب أن تُعيد redirect لـ /auth/login
const PROTECTED_PAGES = [
  '/dashboard',
  '/dashboard/settings',
  '/profile',
  '/billing',
  '/ideas/analyze',
  '/admin',
  '/admin/metrics',
];

// الصفحات العامة — يجب أن تعمل بدون تسجيل دخول
const PUBLIC_PAGES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/pricing',
  '/demo',
  '/investors',
  '/affiliate',
  '/affiliate-terms',
  '/terms',
  '/privacy',
  '/compliance',
  '/changelog',
  '/first-100',
];

export async function checkAuth(
  page: any,
  baseUrl: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  // 1. تحقق أن الصفحات المحمية تُعيد redirect
  for (const path of PROTECTED_PAGES) {
    const response = await page.goto(`${baseUrl}${path}`, {
      waitUntil: 'networkidle',
      timeout: 10000
    }).catch(() => null);

    const finalUrl = page.url();
    const isRedirectedToLogin =
      finalUrl.includes('/auth/login') ||
      finalUrl.includes('/signin') ||
      finalUrl.includes('/login');

    if (!isRedirectedToLogin) {
      results.push({
        id: `auth_unprotected_${path.replace(/\//g, '_')}`,
        name: 'صفحة محمية غير مؤمَّنة',
        page: path,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `الصفحة "${path}" لا تُعيد redirect للمستخدم غير المسجّل`,
        details: `URL النهائي: ${finalUrl}`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 2. تحقق أن الصفحات العامة تعمل
  for (const path of PUBLIC_PAGES) {
    const response = await page.goto(`${baseUrl}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    }).catch(() => null);

    const status = response?.status() ?? 0;

    if (status === 404) {
      results.push({
        id: `auth_404_${path.replace(/\//g, '_')}`,
        name: 'صفحة عامة تُعطي 404',
        page: path,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `الصفحة العامة "${path}" تُعطي خطأ 404`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } else if (status >= 500) {
      results.push({
        id: `auth_500_${path.replace(/\//g, '_')}`,
        name: 'خطأ server في صفحة عامة',
        page: path,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `الصفحة "${path}" تُعطي خطأ server: ${status}`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 3. تحقق أن صفحة login تحتوي على زر Google
  await page.goto(`${baseUrl}/auth/login`);
  const hasGoogleButton = await page.locator('button:has-text("Google"), [data-provider="google"]').count();
  if (hasGoogleButton === 0) {
    results.push({
      id: `auth_no_google`,
      name: 'زر Google غير موجود في صفحة الدخول',
      page: '/auth/login',
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `لم يُعثر على زر "تسجيل الدخول بـ Google" في /auth/login`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 4. تحقق من redirect بعد الدخول (الرابط في URL)
  const loginUrl = page.url();
  const callbackParam = new URL(loginUrl).searchParams.get('callbackUrl');
  // إذا كان المستخدم يحاول الوصول لـ /dashboard ثم أُعيد توجيهه لـ /login
  // يجب أن يكون callbackUrl = /dashboard

  return results;
}
```

---

## الخطوة 7 — فاحص RTL والعربية (qa/checkers/rtl.checker.ts)

```typescript
import type { CheckResult, Device } from '../types';

export async function checkRTL(
  page: any,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  // 1. تحقق من dir="rtl" على الـ html أو body
  const dirIssues = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const htmlDir = html.getAttribute('dir') || html.style.direction;
    const bodyDir = body.getAttribute('dir') || body.style.direction;
    const hasRTL = htmlDir === 'rtl' || bodyDir === 'rtl';
    
    // هل الصفحة تحتوي عربية؟
    const text = document.body.innerText;
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    
    return { hasRTL, hasArabic, htmlDir, bodyDir };
  });

  if (dirIssues.hasArabic && !dirIssues.hasRTL) {
    results.push({
      id: `rtl_missing_${Date.now()}`,
      name: 'اتجاه RTL مفقود',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `الصفحة تحتوي نصاً عربياً لكن dir="rtl" غير موجود`,
      details: `html dir="${dirIssues.htmlDir}", body dir="${dirIssues.bodyDir}"`,
      autoFixable: true,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  // 2. كشف عناصر تبدو مقلوبة (padding/margin خاطئ في RTL)
  const rtlIssues = await page.evaluate(() => {
    const issues: string[] = [];
    // ابحث عن عناصر لها padding-right كبير لكن بدون padding-left (قد يكون مشكلة RTL)
    const allEls = document.querySelectorAll('[class*="pl-"], [class*="pr-"], [style*="padding-left"], [style*="padding-right"]');
    // هذا تحقق بسيط — يمكن توسيعه حسب الحاجة
    return issues;
  });

  // 3. كشف نص عربي داخل عنصر بـ direction: ltr
  const mixedDirectionIssues = await page.evaluate(() => {
    const issues: string[] = [];
    const elements = document.querySelectorAll('p, h1, h2, h3, span, div, button, a');
    elements.forEach(el => {
      const text = el.textContent || '';
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      const style = getComputedStyle(el);
      if (hasArabic && style.direction === 'ltr' && text.trim().length > 10) {
        issues.push(text.trim().slice(0, 30));
      }
    });
    return issues.slice(0, 5);
  });

  for (const issue of mixedDirectionIssues) {
    results.push({
      id: `rtl_ltr_element_${Date.now()}`,
      name: 'نص عربي داخل عنصر LTR',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'medium',
      message: `نص عربي داخل container بـ direction:ltr: "${issue}"`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString()
    });
  }

  return results;
}
```

---

## الخطوة 8 — فاحص الوكلاء (qa/checkers/agents.checker.ts)

يختبر كل الـ 16 وكيل:

```typescript
import type { CheckResult, Device } from '../types';

const AGENTS = [
  { id: 'general',         name: 'المساعد العام' },
  { id: 'cfo',             name: 'المدير المالي' },
  { id: 'legal',           name: 'المستشار القانوني' },
  { id: 'marketing',       name: 'مدير التسويق' },
  { id: 'sales',           name: 'مدير المبيعات' },
  { id: 'hr',              name: 'مدير الموارد البشرية' },
  { id: 'operations',      name: 'مدير العمليات' },
  { id: 'product',         name: 'مدير المنتج' },
  { id: 'investor',        name: 'مستشار الاستثمار' },
  { id: 'customer-voice',  name: 'صوت العملاء' },
  { id: 'idea-validator',  name: 'مُحقِّق الأفكار' },
  { id: 'plan-builder',    name: 'بناء الخطط' },
  { id: 'mistake-shield',  name: 'درع الأخطاء' },
  { id: 'success-museum',  name: 'متحف النجاح' },
  { id: 'opportunity-radar', name: 'رادار الفرص' },
  { id: 'real-estate',     name: 'مستشار العقارات' },
];

const TEST_MESSAGE = 'مرحباً، ما دورك وكيف تساعدني؟';

export async function checkAgents(
  baseUrl: string,
  authToken: string  // Firebase ID token للاختبار
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const agent of AGENTS) {
    const start = Date.now();
    
    try {
      const response = await fetch(`${baseUrl}/api/agents/${agent.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: TEST_MESSAGE }],
          stream: false  // للاختبار فقط
        }),
        signal: AbortSignal.timeout(15000) // 15 ثانية max
      });

      const duration = Date.now() - start;

      if (!response.ok) {
        results.push({
          id: `agent_fail_${agent.id}`,
          name: `وكيل "${agent.name}" لا يستجيب`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'fail',
          severity: 'critical',
          message: `الوكيل "${agent.name}" (${agent.id}) يُعطي status ${response.status}`,
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString()
        });
        continue;
      }

      const data = await response.json().catch(() => null);

      // تحقق من وجود محتوى في الرد
      const content = data?.content || data?.message || data?.text || '';
      if (!content || content.length < 10) {
        results.push({
          id: `agent_empty_${agent.id}`,
          name: `وكيل "${agent.name}" يُعيد رداً فارغاً`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'fail',
          severity: 'high',
          message: `الوكيل "${agent.name}" يُعيد رداً فارغاً أو قصيراً جداً`,
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString()
        });
        continue;
      }

      // تحقق من أن الرد بالعربية
      const hasArabic = /[\u0600-\u06FF]/.test(content);
      if (!hasArabic) {
        results.push({
          id: `agent_lang_${agent.id}`,
          name: `وكيل "${agent.name}" يرد بغير العربية`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'warning',
          severity: 'medium',
          message: `الوكيل "${agent.name}" يرد بالإنجليزية بدلاً من العربية`,
          details: content.slice(0, 100),
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString()
        });
        continue;
      }

      // تحقق من سرعة الاستجابة
      if (duration > 10000) {
        results.push({
          id: `agent_slow_${agent.id}`,
          name: `وكيل "${agent.name}" بطيء جداً`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'warning',
          severity: 'medium',
          message: `الوكيل "${agent.name}" استغرق ${duration}ms (الحد المقبول: 10000ms)`,
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error: any) {
      results.push({
        id: `agent_error_${agent.id}`,
        name: `خطأ في الاتصال بوكيل "${agent.name}"`,
        page: `/api/agents/${agent.id}`,
        device: 'server',
        status: 'fail',
        severity: 'critical',
        message: `خطأ تقني في الوكيل "${agent.name}": ${error.message}`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}
```

---

## الخطوة 9 — المنسّق الرئيسي (qa/runner.ts)

يشغّل كل الفحوصات على كل الأجهزة:

```typescript
import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { DEVICES } from './devices';
import { checkLayout } from './checkers/layout.checker';
import { checkContent } from './checkers/content.checker';
import { checkPerformance } from './checkers/performance.checker';
import { checkAuth } from './checkers/auth.checker';
import { checkRTL } from './checkers/rtl.checker';
import { checkAgents } from './checkers/agents.checker';
import { generateReport } from './reporter';
import type { QAReport, CheckResult, PageReport } from './types';

const BASE_URL = process.env.QA_BASE_URL ?? 'http://localhost:5000';
const AUTH_TOKEN = process.env.QA_AUTH_TOKEN ?? '';

// الصفحات التي سيتم فحصها (الصفحات العامة فقط — المحمية تُفحص بشكل منفصل)
const PUBLIC_PAGES_TO_CHECK = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/pricing',
  '/demo',
  '/investors',
  '/affiliate',
  '/affiliate-terms',
  '/terms',
  '/privacy',
  '/compliance',
  '/changelog',
  '/first-100',
  '/opportunities',
  '/marketplace',
  '/success-museum',
];

export async function runQA(): Promise<QAReport> {
  const runId = `qa_${Date.now()}`;
  const allResults: CheckResult[] = [];
  const pageReports: PageReport[] = [];

  console.log(`\n🔍 بدء فحص QA — ${new Date().toLocaleString('ar-EG')}\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. فحص المصادقة والتوجيه (مرة واحدة بدون context خاص)
    console.log('📋 فحص المصادقة والتوجيه...');
    const authContext = await browser.newContext({ viewport: DEVICES.desktop_std });
    const authPage = await authContext.newPage();
    const authResults = await checkAuth(authPage, BASE_URL, DEVICES.desktop_std);
    allResults.push(...authResults);
    await authContext.close();

    // 2. فحص الوكلاء (مرة واحدة على الـ server)
    console.log('🤖 فحص الـ 16 وكيل...');
    if (AUTH_TOKEN) {
      const agentResults = await checkAgents(BASE_URL, AUTH_TOKEN);
      allResults.push(...agentResults);
    } else {
      console.warn('⚠️ QA_AUTH_TOKEN غير محدد — تخطّي فحص الوكلاء');
    }

    // 3. فحص كل صفحة على كل جهاز
    for (const [deviceKey, device] of Object.entries(DEVICES)) {
      console.log(`\n📱 فحص على ${device.label} (${device.width}×${device.height})...`);

      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        userAgent: device.ua,
        locale: 'ar-EG',
        timezoneId: 'Africa/Cairo',
      });

      for (const pagePath of PUBLIC_PAGES_TO_CHECK) {
        const pageUrl = `${BASE_URL}${pagePath}`;
        console.log(`  → ${pagePath}`);

        const p: Page = await context.newPage();
        const pageResults: CheckResult[] = [];
        let loadTimeMs = 0;

        try {
          const startLoad = Date.now();
          await p.goto(pageUrl, { waitUntil: 'networkidle', timeout: 20000 });
          loadTimeMs = Date.now() - startLoad;

          // شغّل كل الفاحصين
          const [layoutRes, contentRes, perfRes, rtlRes] = await Promise.all([
            checkLayout(p, pagePath, device),
            checkContent(p, pagePath, device),
            checkPerformance(p, pagePath, device),
            checkRTL(p, pagePath, device),
          ]);

          pageResults.push(...layoutRes, ...contentRes, ...perfRes, ...rtlRes);

        } catch (error: any) {
          pageResults.push({
            id: `nav_error_${pagePath.replace(/\//g, '_')}`,
            name: 'خطأ في تحميل الصفحة',
            page: pagePath,
            device: device.label,
            status: 'fail',
            severity: 'critical',
            message: `فشل تحميل "${pagePath}": ${error.message}`,
            autoFixable: false,
            duration: 0,
            timestamp: new Date().toISOString()
          });
        } finally {
          await p.close();
        }

        allResults.push(...pageResults);

        const failed = pageResults.filter(r => r.status === 'fail').length;
        const warnings = pageResults.filter(r => r.status === 'warning').length;
        const passed = pageResults.filter(r => r.status === 'pass').length;

        pageReports.push({
          url: pagePath,
          device: device.label,
          loadTimeMs,
          checks: pageResults,
          passed,
          failed,
          warnings,
          criticalCount: pageResults.filter(r => r.severity === 'critical').length
        });
      }

      await context.close();
    }

  } finally {
    await browser.close();
  }

  // حساب النتائج النهائية
  const critical = allResults.filter(r => r.severity === 'critical' && r.status === 'fail');
  const failed = allResults.filter(r => r.status === 'fail').length;
  const warnings = allResults.filter(r => r.status === 'warning').length;
  const passed = allResults.filter(r => r.status === 'pass').length;
  const total = allResults.length;

  // حساب النقاط: 100 - (critical*20 + high*10 + medium*5 + low*2) / total * 100
  const deductions = allResults
    .filter(r => r.status === 'fail')
    .reduce((sum, r) => {
      const weights = { critical: 20, high: 10, medium: 5, low: 2, info: 0 };
      return sum + (weights[r.severity] ?? 0);
    }, 0);
  const score = Math.max(0, Math.round(100 - (deductions / Math.max(total, 1)) * 100));

  const report: QAReport = {
    runId,
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: PUBLIC_PAGES_TO_CHECK.length,
    totalChecks: total,
    passed,
    failed,
    warnings,
    criticalIssues: critical,
    autoFixed: 0, // سيتحدث بعد تشغيل الـ fixers
    manualRequired: allResults.filter(r => r.status === 'fail' && !r.autoFixable),
    pageReports,
    summary: generateSummary(score, critical.length, failed, warnings),
    score
  };

  // طباعة ملخص سريع
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📊 نتائج QA — النقاط: ${score}/100`);
  console.log(`✅ نجح: ${passed} | ❌ فشل: ${failed} | ⚠️ تحذيرات: ${warnings}`);
  console.log(`🔴 حرجة: ${critical.length}`);
  if (critical.length > 0) {
    console.log('\nالمشاكل الحرجة:');
    critical.slice(0, 5).forEach(r => console.log(`  • ${r.message}`));
  }
  console.log(`${'═'.repeat(50)}\n`);

  return report;
}

function generateSummary(score: number, criticalCount: number, failed: number, warnings: number): string {
  if (criticalCount > 0) return `المنصة تحتاج إصلاحات عاجلة — ${criticalCount} مشكلة حرجة`;
  if (score >= 90) return `المنصة في حالة ممتازة — جاهزة للإطلاق`;
  if (score >= 75) return `المنصة في حالة جيدة — ${failed} مشكلة تحتاج مراجعة`;
  return `المنصة تحتاج تحسينات — نقاط: ${score}/100`;
}
```

---

## الخطوة 10 — مولّد التقارير (qa/reporter.ts)

يولّد تقريراً بصرياً كاملاً:

```typescript
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { QAReport } from './types';

export function generateReport(report: QAReport): string {
  const criticalHTML = report.criticalIssues
    .map(r => `<tr class="critical">
      <td>${r.page}</td>
      <td>${r.device}</td>
      <td>${r.name}</td>
      <td>${r.message}</td>
      <td>${r.autoFixable ? '🔧 تلقائي' : '👤 يدوي'}</td>
    </tr>`).join('');

  const deviceSummary = Object.entries(
    report.pageReports.reduce((acc, r) => {
      if (!acc[r.device]) acc[r.device] = { pass: 0, fail: 0, warn: 0 };
      acc[r.device].pass += r.passed;
      acc[r.device].fail += r.failed;
      acc[r.device].warn += r.warnings;
      return acc;
    }, {} as Record<string, { pass: number; fail: number; warn: number }>)
  ).map(([device, stats]) =>
    `<div class="device-card ${stats.fail > 0 ? 'has-issues' : 'clean'}">
      <b>${device}</b>
      <span class="pass">✅ ${stats.pass}</span>
      <span class="fail">❌ ${stats.fail}</span>
      <span class="warn">⚠️ ${stats.warn}</span>
    </div>`
  ).join('');

  const scoreColor = report.score >= 90 ? '#3B6D11' : report.score >= 75 ? '#854F0B' : '#A32D2D';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير QA — كلميرون — ${new Date(report.timestamp).toLocaleDateString('ar-EG')}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f0; color: #2c2c2a; padding: 2rem; }
  .header { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; border: 0.5px solid #e0e0d8; }
  .score { font-size: 64px; font-weight: 500; color: ${scoreColor}; }
  .score-label { font-size: 14px; color: #888; }
  .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.5rem; }
  .card { background: white; border-radius: 8px; padding: 1rem; border: 0.5px solid #e0e0d8; text-align: center; }
  .card-num { font-size: 28px; font-weight: 500; }
  .card-label { font-size: 12px; color: #888; margin-top: 4px; }
  .devices { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
  .device-card { background: white; border-radius: 8px; padding: 12px 16px; border: 0.5px solid #e0e0d8; }
  .device-card.has-issues { border-color: #E24B4A; }
  .device-card.clean { border-color: #639922; }
  .device-card b { display: block; margin-bottom: 6px; }
  .pass { color: #3B6D11; margin-left: 8px; }
  .fail { color: #A32D2D; margin-left: 8px; }
  .warn { color: #854F0B; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 1.5rem; }
  th { background: #f5f5f0; padding: 10px 12px; font-size: 12px; text-align: right; font-weight: 500; }
  td { padding: 10px 12px; font-size: 13px; border-top: 0.5px solid #e0e0d8; }
  tr.critical td { background: #FCEBEB; }
  h2 { font-size: 16px; font-weight: 500; margin-bottom: 12px; }
  .section { margin-bottom: 2rem; }
</style>
</head>
<body>

<div class="header">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <h1 style="font-size:24px;font-weight:500;margin-bottom:4px">تقرير QA — كلميرون AI</h1>
      <p style="font-size:14px;color:#888">${new Date(report.timestamp).toLocaleString('ar-EG')} — ${report.baseUrl}</p>
      <p style="font-size:14px;margin-top:8px">${report.summary}</p>
    </div>
    <div style="text-align:center">
      <div class="score">${report.score}</div>
      <div class="score-label">/ 100</div>
    </div>
  </div>
</div>

<div class="grid4">
  <div class="card"><div class="card-num" style="color:#3B6D11">${report.passed}</div><div class="card-label">اختبار نجح</div></div>
  <div class="card"><div class="card-num" style="color:#A32D2D">${report.failed}</div><div class="card-label">اختبار فشل</div></div>
  <div class="card"><div class="card-num" style="color:#854F0B">${report.warnings}</div><div class="card-label">تحذيرات</div></div>
  <div class="card"><div class="card-num" style="color:#A32D2D">${report.criticalIssues.length}</div><div class="card-label">مشاكل حرجة</div></div>
</div>

<div class="section">
  <h2>النتائج حسب الجهاز</h2>
  <div class="devices">${deviceSummary}</div>
</div>

${report.criticalIssues.length > 0 ? `
<div class="section">
  <h2>المشاكل الحرجة — يجب الإصلاح الفوري</h2>
  <table>
    <tr><th>الصفحة</th><th>الجهاز</th><th>نوع المشكلة</th><th>التفاصيل</th><th>الإصلاح</th></tr>
    ${criticalHTML}
  </table>
</div>` : '<div class="section" style="background:white;border-radius:8px;padding:1.5rem;border:0.5px solid #639922;color:#3B6D11;text-align:center">لا توجد مشاكل حرجة 🎉</div>'}

</body>
</html>`;

  // حفظ التقرير
  const reportPath = join(process.cwd(), 'qa', 'reports', `report_${report.runId}.html`);
  writeFileSync(reportPath, html, 'utf-8');

  // حفظ JSON أيضاً
  writeFileSync(
    join(process.cwd(), 'qa', 'reports', `report_${report.runId}.json`),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  console.log(`📄 التقرير محفوظ: ${reportPath}`);
  return reportPath;
}
```

---

## الخطوة 11 — نقطة الدخول (qa/index.ts)

```typescript
import { runQA } from './runner';
import { generateReport } from './reporter';

async function main() {
  try {
    const report = await runQA();
    const reportPath = generateReport(report);

    // إذا كانت هناك مشاكل حرجة — فشل CI/CD
    if (report.criticalIssues.length > 0) {
      console.error(`\n🔴 ${report.criticalIssues.length} مشكلة حرجة — يجب الإصلاح قبل النشر\n`);
      process.exit(1);
    }

    if (report.score < 75) {
      console.warn(`\n⚠️ النقاط ${report.score}/100 — يُنصح بالمراجعة قبل النشر\n`);
      process.exit(0); // لا يوقف CI لكن يُحذّر
    }

    console.log(`\n✅ اجتاز QA بنجاح — النقاط: ${report.score}/100\n`);
    process.exit(0);

  } catch (error) {
    console.error('خطأ في تشغيل QA:', error);
    process.exit(1);
  }
}

main();
```

---

## الخطوة 12 — تكامل مع CI/CD

أضف هذه scripts في `package.json`:

```json
{
  "scripts": {
    "qa": "tsx qa/index.ts",
    "qa:fast": "QA_DEVICES=desktop_std,iphone tsx qa/index.ts",
    "qa:full": "QA_DEVICES=all tsx qa/index.ts",
    "qa:watch": "nodemon --watch app --watch components --ext tsx,ts --exec 'npm run qa:fast'",
    "precommit": "npm run typecheck && npm run lint && npm run qa:fast"
  }
}
```

وفي `.github/workflows/qa.yml` (GitHub Actions):

```yaml
name: QA Automated Check
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run build
      - run: npm start &
      - run: sleep 5
      - run: QA_BASE_URL=http://localhost:5000 npm run qa
        env:
          QA_AUTH_TOKEN: ${{ secrets.QA_AUTH_TOKEN }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qa-report
          path: qa/reports/
```

---

## الخطوة 13 — استخدام النظام يومياً

بعد كل تطوير:

```bash
# فحص سريع (2 جهاز فقط — للتطوير اليومي)
npm run qa:fast

# فحص كامل (كل الأجهزة — قبل كل deploy)
npm run qa:full

# فحص تلقائي عند حفظ أي ملف
npm run qa:watch
```

---

## القواعد الإلزامية للنظام

```
PLAYWRIGHT:
✓ تثبيت: npm install --save-dev @playwright/test && npx playwright install chromium
✓ timeout افتراضي 20 ثانية لكل صفحة
✓ headless: true في CI، false في التطوير للمراجعة البصرية

PERFORMANCE:
✓ شغّل الفحوصات بشكل متوازٍ (Promise.all) حيث أمكن
✓ لا تحمّل أكثر من 3 صفحات بشكل متوازٍ لتجنب إرهاق الـ server

REPORTS:
✓ احفظ كل تقرير في qa/reports/ باسم يتضمن التاريخ
✓ لا تحذف التقارير القديمة — احتفظ بآخر 30 تقريراً
✓ أضف qa/reports/ لـ .gitignore

CI/CD:
✓ exit(1) إذا وُجدت مشاكل critical
✓ exit(0) إذا النقاط < 75 (تحذير فقط)
✓ exit(0) إذا كل شيء سليم
```

**بعد بناء النظام:** شغّل `npm run qa:fast` وتأكد أنه يعطي تقريراً حقيقياً في `qa/reports/`

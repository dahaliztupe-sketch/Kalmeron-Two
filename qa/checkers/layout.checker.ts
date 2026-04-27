import type { Page } from '@playwright/test';
import type { CheckResult, Device } from '../types';

export async function checkLayout(
  page: Page,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  // 1. كشف العناصر الخارجة من حدود الشاشة
  const overflowIssues = await page.evaluate((deviceWidth: number) => {
    const issues: { selector: string; details: string }[] = [];
    const all = document.querySelectorAll('*');

    all.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);

      // Tolerance: sub-pixel rounding, antialiasing, scrollbar gutters, and
      // decorative borders/shadows commonly cause 1-7px overshoots that aren't
      // user-visible. Flag only meaningful overflow (>= 8px).
      const OVERFLOW_TOLERANCE = 8;

      if (rect.right > deviceWidth + OVERFLOW_TOLERANCE) {
        const className =
          el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : '';
        const selector = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + className;
        issues.push({
          selector,
          details: `يخرج ${Math.round(rect.right - deviceWidth)}px من اليمين`,
        });
      }

      if (style.overflow === 'visible' && el.scrollWidth > el.clientWidth + OVERFLOW_TOLERANCE) {
        issues.push({
          selector: el.tagName.toLowerCase(),
          details: `نص يتجاوز عرض الحاوية بـ ${el.scrollWidth - el.clientWidth}px`,
        });
      }
    });

    return issues.slice(0, 20);
  }, device.width);

  for (const issue of overflowIssues) {
    results.push({
      id: `layout_overflow_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
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
      timestamp: new Date().toISOString(),
    });
  }

  // 2. كشف النصوص المتداخلة
  const overlappingTexts = await page.evaluate(() => {
    const texts = Array.from(
      document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,label')
    );
    const issues: string[] = [];

    const MIN_OVERLAP_PX = 6;

    const isEffectivelyVisible = (el: Element): boolean => {
      const anyEl = el as Element & { checkVisibility?: (opts?: object) => boolean };
      if (typeof anyEl.checkVisibility === 'function') {
        if (!anyEl.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })) {
          return false;
        }
      }
      let cur: Element | null = el.parentElement;
      while (cur) {
        const cs = getComputedStyle(cur);
        const clipped =
          (cs.overflow === 'hidden' || cs.overflowY === 'hidden' || cs.overflowX === 'hidden') &&
          (cur.clientHeight === 0 || cur.clientWidth === 0);
        if (clipped) return false;
        cur = cur.parentElement;
      }
      return true;
    };

    for (let i = 0; i < texts.length - 1; i++) {
      const a = texts[i];
      const b = texts[i + 1];

      if (a.contains(b) || b.contains(a)) continue;

      const aText = (a.textContent || '').trim();
      const bText = (b.textContent || '').trim();
      if (!aText || !bText) continue;
      if (aText === bText || aText.includes(bText) || bText.includes(aText)) continue;

      if (!isEffectivelyVisible(a) || !isEffectivelyVisible(b)) continue;

      const r1 = a.getBoundingClientRect();
      const r2 = b.getBoundingClientRect();

      if (r1.width === 0 || r1.height === 0) continue;
      if (r2.width === 0 || r2.height === 0) continue;

      const overlapX = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
      const overlapY = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);

      if (overlapX > MIN_OVERLAP_PX && overlapY > MIN_OVERLAP_PX) {
        issues.push(`"${aText.slice(0, 20)}" و "${bText.slice(0, 20)}"`);
      }
    }
    return issues.slice(0, 5);
  });

  for (const issue of overlappingTexts) {
    results.push({
      id: `layout_overlap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'نصوص متداخلة',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `نصوص متداخلة: ${issue}`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. كشف الصور المكسورة
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src || img.getAttribute('src') || 'unknown');
  });

  for (const src of brokenImages) {
    results.push({
      id: `layout_broken_img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'صورة مكسورة',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'medium',
      message: `صورة لا تُحمَّل: ${src.slice(-60)}`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // 4. أزرار صغيرة على الهاتف
  if (device.width <= 430) {
    const smallTouchTargets = await page.evaluate(() => {
      const clickable = document.querySelectorAll(
        'button, a, [role="button"], input[type="submit"]'
      );
      const issues: string[] = [];
      clickable.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height < 44) {
          issues.push(
            `"${el.textContent?.trim().slice(0, 20) || el.tagName}" — ارتفاع ${Math.round(rect.height)}px (الحد الأدنى 44px)`
          );
        }
      });
      return issues.slice(0, 10);
    });

    for (const issue of smallTouchTargets) {
      results.push({
        id: `layout_touch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: 'هدف لمس صغير جداً',
        page: url,
        device: device.label,
        status: 'warning',
        severity: 'medium',
        message: `زر أو رابط صغير على الهاتف: ${issue}`,
        autoFixable: true,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 5. تمرير أفقي
  const hasHorizontalScroll = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 5
    );
  });

  if (hasHorizontalScroll) {
    results.push({
      id: `layout_hscroll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'تمرير أفقي غير مقصود',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `الصفحة تحتوي على تمرير أفقي — يدمر تجربة المستخدم على الهاتف`,
      autoFixable: true,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}

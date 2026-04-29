import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditPayments(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  const pkg = existsSync('package.json')
    ? JSON.parse(readFileSync('package.json', 'utf8'))
    : { dependencies: {}, devDependencies: {} };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const hasStripe = !!deps['stripe'] || !!deps['@stripe/stripe-js'];
  const hasPaddle = !!deps['@paddle/paddle-js'] || !!deps['@paddle/paddle-node-sdk'];
  const hasPaymob = safeExec('rg -l "Paymob|paymob|fawry" app src 2>/dev/null').length > 0;
  const billingDir = existsSync('app/api/billing') || existsSync('app/api/stripe');

  // ── No payments at all ──
  if (!hasStripe && !hasPaddle && !hasPaymob && !billingDir) {
    findings.push({
      id: 'PAY-001',
      category: 'payments',
      severity: 'high',
      title: 'لا يوجد نظام مدفوعات مفعّل',
      description: 'بدون مدفوعات: لا يمكن للمنصة توليد إيرادات',
      fix: 'استخدم Stripe (دولي) + Paymob/Fawry (مصر) للسوق المحلي',
      autoFixable: false,
    });
    return findings;
  }

  if (hasStripe) {
    // ── Webhook route ──
    const webhookFiles = [
      'app/api/webhooks/stripe/route.ts',
      'app/api/stripe/webhook/route.ts',
      'app/api/billing/webhook/route.ts',
    ];
    const webhook = webhookFiles.find(existsSync);
    if (!webhook) {
      findings.push({
        id: 'PAY-002',
        category: 'payments',
        severity: 'critical',
        title: 'Stripe webhook route مفقود',
        description: 'بدون webhook: التطبيق لن يعرف أن المستخدم دفع أو ألغى الاشتراك',
        fix: 'أنشئ app/api/webhooks/stripe/route.ts مع stripe.webhooks.constructEvent',
        autoFixable: false,
        references: ['https://stripe.com/docs/webhooks'],
      });
    } else {
      const wh = readFileSync(webhook, 'utf8');
      // Idempotency
      if (!/idempot|processed.*event|event_id/i.test(wh)) {
        findings.push({
          id: 'PAY-003',
          category: 'payments',
          severity: 'high',
          title: 'Stripe webhook بدون idempotency',
          description: 'Stripe يُعيد إرسال webhooks — بدون idempotency قد يحدث تكرار',
          location: webhook,
          fix: 'احفظ event.id في Firestore وتحقق قبل المعالجة',
          autoFixable: false,
        });
      }
      // Required events
      const requiredEvents = [
        'checkout.session.completed',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_failed',
      ];
      const missing = requiredEvents.filter(e => !wh.includes(e));
      if (missing.length > 0) {
        findings.push({
          id: 'PAY-004',
          category: 'payments',
          severity: 'medium',
          title: `Stripe webhook لا يعالج ${missing.length} حدث مهم`,
          description: 'الأحداث المفقودة: ' + missing.join(', '),
          location: webhook,
          fix: 'أضف case لكل event في switch أو بُنية handler',
          autoFixable: false,
        });
      }
    }

    // ── Customer portal ──
    const hasPortal = safeExec(
      `rg -l "billingPortal\\.sessions\\.create|customer-portal" app src 2>/dev/null`
    ).split('\n').filter(Boolean).length > 0;
    if (!hasPortal) {
      findings.push({
        id: 'PAY-005',
        category: 'payments',
        severity: 'medium',
        title: 'Stripe Customer Portal غير متاح',
        description: 'المستخدمون لا يستطيعون إدارة اشتراكاتهم بأنفسهم — يولّد تكتات دعم',
        fix: 'أضف /api/billing/portal route يستدعي stripe.billingPortal.sessions.create',
        autoFixable: false,
        references: ['https://stripe.com/docs/billing/subscriptions/customer-portal'],
      });
    }

    // ── Tax / VAT ──
    const hasTax = safeExec(
      `rg -l "automatic_tax|tax_rates|VAT|ضريبة" app src -g "*.ts" 2>/dev/null`
    ).split('\n').filter(Boolean).length > 0;
    if (!hasTax) {
      findings.push({
        id: 'PAY-006',
        category: 'payments',
        severity: 'high',
        title: 'لا يوجد حساب للضريبة (Stripe Tax / VAT)',
        description: 'القانون المصري + EU يلزمك بإضافة VAT — تجاهلها يعرضك لغرامات',
        fix: 'فعّل automatic_tax: { enabled: true } في checkout sessions',
        autoFixable: false,
        references: ['https://stripe.com/docs/tax'],
      });
    }

    // ── Refund policy enforcement ──
    const hasRefund = safeExec(
      `rg -l "refunds\\.create|refund.*policy|سياسة الاسترداد" app src components 2>/dev/null`
    ).split('\n').filter(Boolean).length > 0;
    if (!hasRefund) {
      findings.push({
        id: 'PAY-007',
        category: 'payments',
        severity: 'medium',
        title: 'لا يوجد آلية / سياسة استرداد واضحة',
        description: 'بدون سياسة refund: chargebacks تتراكم وتُؤثر على Stripe account standing',
        fix: 'أضف /refund-policy + admin route لإصدار refunds + تواصل مع stripe.refunds.create',
        autoFixable: false,
      });
    }

    // ── Pricing page ──
    if (!existsSync('app/pricing/page.tsx') && !existsSync('app/(marketing)/pricing/page.tsx')) {
      findings.push({
        id: 'PAY-008',
        category: 'payments',
        severity: 'high',
        title: 'صفحة Pricing مفقودة',
        description: 'بدون صفحة أسعار: المستخدم لا يعرف ما يدفع له — أكبر سبب لـ drop-off',
        fix: 'أنشئ app/pricing/page.tsx بـ 3 خطط واضحة + CTA',
        autoFixable: false,
      });
    }
  }

  // ── Test env keys check ──
  const envExample = existsSync('.env.example') ? readFileSync('.env.example', 'utf8') : '';
  if (hasStripe && !envExample.includes('STRIPE_')) {
    findings.push({
      id: 'PAY-009',
      category: 'payments',
      severity: 'medium',
      title: 'متغيرات Stripe غير موثّقة في .env.example',
      description: 'المساهمون لا يعرفون أنهم يحتاجون STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET',
      fix: 'أضف STRIPE_SECRET_KEY=, STRIPE_WEBHOOK_SECRET=, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= في .env.example',
      autoFixable: true,
    });
  }

  // ── Subscription lifecycle in Firestore ──
  const subsModel = safeExec(
    `rg -l "subscription.*status|stripe_customer_id|stripeCustomerId|trial_end" src app -g "*.ts" 2>/dev/null`
  ).split('\n').filter(Boolean).length;
  if (hasStripe && subsModel < 2) {
    findings.push({
      id: 'PAY-010',
      category: 'payments',
      severity: 'medium',
      title: 'نموذج الاشتراك في Firestore غير واضح',
      description: 'لا يوجد سجل لـ stripe_customer_id / subscription_status في DB',
      fix: 'احفظ user.stripeCustomerId, subscription.status, plan, currentPeriodEnd في Firestore',
      autoFixable: false,
    });
  }

  return findings;
}

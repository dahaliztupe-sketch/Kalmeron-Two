/**
 * Welcome email — قالب react-email على نمط Resend / Stripe.
 * يُستخدم من `src/lib/email/send-welcome.ts` بعد إنشاء الحساب.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export interface WelcomeEmailProps {
  firstName?: string;
  loginUrl?: string;
}

export default function WelcomeEmail({
  firstName = "صديقنا",
  loginUrl = "https://kalmeron.ai/dashboard",
}: WelcomeEmailProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>أهلاً بك في Kalmeron AI — منصة الأعمال الذكية للسوق المصري</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-xl rounded-lg bg-white p-8">
            <Section className="text-center">
              <Img
                src="https://kalmeron.ai/icon-512.png"
                width="64"
                height="64"
                alt="شعار Kalmeron AI"
                className="mx-auto"
              />
              <Heading className="mt-4 text-2xl font-bold text-gray-900">
                أهلاً {firstName}، مرحباً بك في Kalmeron AI
              </Heading>
            </Section>

            <Section className="mt-6">
              <Text className="text-base leading-7 text-gray-700">
                سعداء بانضمامك! Kalmeron AI هي منصتك الذكية لاتخاذ قرارات الأعمال في السوق المصري —
                من تحليل الأفكار، حساب الجدوى، حتى متابعة فرص التمويل والفعاليات.
              </Text>

              <Text className="mt-4 text-base leading-7 text-gray-700">
                للبدء، انتقل إلى لوحة التحكم وجرّب أول محادثة مع وكيل تحليل الأفكار:
              </Text>

              <Section className="mt-6 text-center">
                <Button
                  href={loginUrl}
                  className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
                >
                  ادخل إلى لوحة التحكم
                </Button>
              </Section>
            </Section>

            <Hr className="my-8 border-gray-200" />

            <Section>
              <Text className="text-sm text-gray-500">
                ماذا يمكنك أن تجرّب اليوم؟
              </Text>
              <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                <li>تحليل فكرة مشروع وإنتاج تقرير جدوى مالية كاملة</li>
                <li>كشف الأخطاء القاتلة قبل ضخ أموالك</li>
                <li>متابعة فرص التمويل في مصر والخليج</li>
                <li>محادثة وكيل قانوني للجوانب التنظيمية</li>
              </ul>
            </Section>

            <Hr className="my-8 border-gray-200" />

            <Text className="text-xs text-gray-400">
              إذا لم تنشئ هذا الحساب، تجاهل هذه الرسالة. لأي استفسار، راسلنا على{" "}
              <a href="mailto:support@kalmeron.ai" className="text-indigo-600">support@kalmeron.ai</a>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

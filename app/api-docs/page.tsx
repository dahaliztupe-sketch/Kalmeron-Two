import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalmeron API — توثيق المطورين',
  description: 'مرجع REST API الرسمي لمنصة Kalmeron AI: مفاتيح API، Webhooks، OpenAPI 3.1، حدود المعدل، هياكل الأخطاء، وأمثلة التكامل بالكود للمطورين.',
};

export const dynamic = 'force-static';

export default function ApiDocsPage() {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0 }}>
        <script
          id="api-reference"
          data-url="/api-docs/openapi.yaml"
          data-configuration={JSON.stringify({
            theme: 'kepler',
            darkMode: true,
            hideDownloadButton: false,
            metaData: { title: 'Kalmeron API' },
          })}
        />
        <script
          src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"
          async
        />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/src/lib/cache/query-client";
import { cn } from "@/src/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/cookie-banner";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { WebVitals } from "@/components/analytics/WebVitals";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { sanitizeJsonLd } from "@/src/lib/security/safe-json-ld";
import { ScrollRestoration } from "@/components/utils/ScrollRestoration";

// ═══ Lean typography stack — perf-first ═══
// Reduced from 4 fonts × 17 weights → 2 fonts × 5 weights (~70% smaller font payload).
// Tajawal & JetBrains Mono dropped; CSS fallbacks (`--font-tajawal`, `--font-mono`) point to plex-ar / system mono.
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-ar",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#04060B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // P0 quick win: declare both color schemes so browser UI (forms, scrollbars)
  // matches our dark-first design without flicker on system-light setups.
  colorScheme: "dark light",
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "كلميرون | نظام تشغيل المؤسّس العربي بالذكاء الاصطناعي",
      template: "%s | كلميرون Kalmeron"
    },
    description: "٥٧ مساعداً ذكياً متخصصاً في ٧ أقسام يعملون كفريقك المؤسّس الكامل — بالعربية الأصيلة. تحليل الأفكار، خطط العمل، النمذجة المالية، التأسيس القانوني، وتحليل السوق — كل ذلك في مكان واحد.",
    keywords: [
      "ذكاء اصطناعي", "ريادة أعمال", "خطط عمل", "تمويل ناشئ",
      "Kalmeron", "كلميرون", "startup AI", "AI business", "مستشار ذكي",
      "AI for founders", "نظام تشغيل المؤسّس", "مساعد ذكاء اصطناعي عربي",
      "خطة عمل بالذكاء الاصطناعي", "تحليل السوق", "تأسيس شركة",
      "Arab AI platform", "business plan AI Arabic", "AI startup advisor"
    ],
    manifest: "/manifest.json",
    openGraph: {
      title: "كلميرون — ٥٧ مساعداً ذكياً للمؤسّس العربي",
      description: "٥٧ مساعداً ذكياً في ٧ أقسام يعملون كفريقك المؤسّس — بالعربية الأصيلة. يثق فيه ١٢٠٠+ مؤسّس في ١٢ دولة عربية.",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent("نظام تشغيل المؤسّس العربي")}&type=default`,
          width: 1200,
          height: 630,
          alt: "كلميرون — الذكاء الاصطناعي للمؤسّس العربي",
        },
      ],
      locale: "ar_EG",
      alternateLocale: ["en_US", "ar_SA", "ar_AE"],
      type: "website",
      url: siteUrl,
      siteName: "كلميرون Kalmeron",
    },
    twitter: {
      card: "summary_large_image",
      title: "كلميرون — ٥٧ مساعداً ذكياً للمؤسّس العربي",
      description: "٥٧ مساعداً ذكياً في ٧ أقسام يعملون كفريقك المؤسّس — بالعربية الأصيلة.",
      images: [`/api/og?title=${encodeURIComponent("نظام تشغيل المؤسّس العربي")}&type=default`],
      creator: "@kalmeronai",
      site: "@kalmeronai",
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        ar: `${siteUrl}/ar`,
        en: `${siteUrl}/en`,
        "x-default": siteUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true, follow: true,
        'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1,
      },
    },
    category: "business",
    applicationName: "Kalmeron",
    authors: [{ name: "Kalmeron AI", url: siteUrl }],
    creator: "Kalmeron AI",
    publisher: "Kalmeron AI",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      "name": "Kalmeron",
      "alternateName": ["كلميرون", "Kalmeron AI"],
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "Artificial Intelligence Platform",
      "operatingSystem": "Web, iOS, Android (PWA)",
      "description": "٥٧ مساعداً ذكياً متخصصاً في ٧ أقسام يعملون كفريقك المؤسّس الكامل — بالعربية الأصيلة. تحليل الأفكار، خطط العمل، النمذجة المالية، التأسيس القانوني، وتحليل السوق — كل ذلك في مكان واحد.",
      "url": siteUrl,
      "image": `${siteUrl}/brand/og-cover.png`,
      "inLanguage": ["ar", "en"],
      "availableOnDevice": "Web Browser",
      "featureList": [
        "57 Specialised AI Assistants",
        "Arabic-native AI (no machine translation)",
        "Egyptian market analysis and legal compliance",
        "Financial modelling and cash runway calculator",
        "Business plan generator",
        "Opportunity radar for Egyptian startups",
        "Knowledge base with RAG (PDF, Excel, CSV)",
        "Multi-agent council for strategic decisions",
        "Workflows automation engine",
        "Company builder with org chart",
      ],
      "offers": [
        { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "EGP" },
        { "@type": "Offer", "name": "Starter", "price": "199", "priceCurrency": "EGP" },
        { "@type": "Offer", "name": "Pro", "price": "499", "priceCurrency": "EGP" },
        { "@type": "Offer", "name": "Founder", "price": "999", "priceCurrency": "EGP" },
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1200",
        "bestRating": "5",
        "worstRating": "1",
      },
      "author": { "@type": "Organization", "@id": `${siteUrl}/#org`, "name": "Kalmeron AI" },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#org`,
      "name": "Kalmeron AI",
      "alternateName": "كلميرون",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/brand/logo.svg`,
        "width": 200,
        "height": 50,
      },
      "description": "منصة الذكاء الاصطناعي الأولى للمؤسّسين العرب — تقدّم ٥٧ مساعداً ذكياً متخصصاً في ٧ أقسام بالعربية الأصيلة.",
      "foundingLocation": {
        "@type": "Place",
        "address": { "@type": "PostalAddress", "addressCountry": "EG", "addressLocality": "Cairo" },
      },
      "areaServed": ["EG", "SA", "AE", "KW", "QA", "BH", "OM", "JO", "LB", "MA", "TN", "LY"],
      "sameAs": [
        "https://twitter.com/kalmeronai",
        "https://linkedin.com/company/kalmeron",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "availableLanguage": ["Arabic", "English"],
        "email": "support@kalmeron.app",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "كلميرون — Kalmeron",
      "inLanguage": ["ar", "en"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${siteUrl}/chat?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "ما هو كلميرون؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "كلميرون هو نظام تشغيل للمؤسّس يضمّ ٥٧ مساعداً ذكياً متخصصاً في ٧ أقسام — CEO، CFO، CMO، CTO، CLO، CHRO، وCSO — يعملون بالعربية الأصيلة ويفهمون سوقك ويتكيفون مع بيئتك.",
          },
        },
        {
          "@type": "Question",
          "name": "هل كلميرون مجاني؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، كلميرون يتيح ٢٠٠ رسالة يومياً و٣٠٠٠ رسالة شهرياً مجاناً بدون بطاقة ائتمان. الخطط المدفوعة متاحة بأسعار تنافسية تناسب كل مؤسّس.",
          },
        },
        {
          "@type": "Question",
          "name": "هل كلميرون يدعم اللغة العربية؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، كلميرون مبني أصلاً بالعربية — وليس ترجمة. يفهم اللهجة المصرية وخلط العربية والإنجليزية (Arabizi) ويردّ بأسلوب طبيعي.",
          },
        },
        {
          "@type": "Question",
          "name": "كيف يختلف كلميرون عن ChatGPT؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "كلميرون مخصص للمؤسّسين ويعمل بالعربية الأصيلة، بعكس ChatGPT العام. يضمّ ٥٧ مساعداً متخصصاً مدرّبين على بيانات ريادة الأعمال، قانون الشركات، والنمذجة المالية — لا أداة عامة.",
          },
        },
      ],
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Arabic-first defaults: render dir="rtl" lang="ar" for the default locale,
  // switching to dir="ltr" lang="en" only when the user explicitly chose English.
  const htmlLang = locale === 'en' ? 'en' : 'ar';
  const htmlDir = locale === 'en' ? 'ltr' : 'rtl';

  return (
    <html lang={htmlLang} dir={htmlDir} className={cn(plexArabic.variable, plusJakarta.variable)} suppressHydrationWarning data-scroll-behavior="smooth" data-default-lang="ar" data-default-dir="rtl">
      <head>
        {/* Performance: pre-warm only origins used on first paint. Firebase preconnects moved to AuthProvider on demand. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml -- safeJsonLd escapes </script and HTML entities; required for SEO JSON-LD per schema.org guidelines
          dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#04060B] text-[#F8FAFC] selection:bg-indigo-500/40">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:bg-indigo-600 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          تخطي إلى المحتوى الرئيسي (skip to main content)
        </a>
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
              <AuthProvider>
                <QueryProvider>
                  <ScrollRestoration />
                  <div id="main-content">
                    {children}
                  </div>
                  <CookieBanner />
                  <Toaster position="top-right" richColors />
                  <ServiceWorkerRegistrar />
                  <WebVitals />
                </QueryProvider>
              </AuthProvider>
            </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

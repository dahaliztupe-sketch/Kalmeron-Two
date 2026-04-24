import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Tajawal, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/src/lib/cache/query-client";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/cookie-banner";
import { IntroPreloader } from "@/components/brand/IntroPreloader";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { WebVitals } from "@/components/analytics/WebVitals";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { LanguageProvider } from "@/contexts/LanguageContext";

// ═══ Premium Arabic typography stack ═══
// IBM Plex Sans Arabic — primary display + UI (architectural, modern, IBM-grade)
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-ar",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

// Tajawal — secondary fallback, excellent for long-form Arabic body
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

// Plus Jakarta — Latin pages + numerals
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// JetBrains Mono — code blocks, KBD, tabular data
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
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
      default: "Kalmeron AI | نظام تشغيل رواد الأعمال",
      template: "%s | Kalmeron AI"
    },
    description: "مقرّ عمليات شركتك الذكي: 7 أقسام و16 مساعداً ذكياً متخصصاً يعملون كفريقك المؤسّس. حوّل فكرتك إلى شركة ناجحة.",
    keywords: [
      "ذكاء اصطناعي", "ريادة أعمال", "مصر", "خطط عمل", "تمويل ناشئ",
      "Kalmeron", "كلميرون", "startup Egypt", "AI business", "مستشار ذكي"
    ],
    manifest: "/manifest.json",
    openGraph: {
      title: "Kalmeron AI | مقرّ عمليات شركتك الذكي",
      description: "7 أقسام و16 مساعداً ذكياً يعملون كفريقك المؤسّس.",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent("مقرّ عمليات شركتك الذكي")}&type=default`,
          width: 1200,
          height: 630,
          alt: "Kalmeron AI",
        },
      ],
      locale: "ar_EG",
      alternateLocale: ["en_US", "ar_SA", "ar_AE"],
      type: "website",
      url: siteUrl,
      siteName: "Kalmeron AI",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kalmeron AI | مقرّ عمليات شركتك الذكي",
      description: "7 أقسام و16 مساعداً ذكياً يعملون كفريقك المؤسّس.",
      images: [`/api/og?title=${encodeURIComponent("مقرّ عمليات شركتك الذكي")}&type=default`],
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
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kalmeron AI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "مقرّ عمليات شركتك الذكي: 7 أقسام و16 مساعداً ذكياً متخصصاً.",
  "url": siteUrl,
  "image": `${siteUrl}/brand/logo.svg`,
  "inLanguage": "ar",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EGP" },
  "author": { "@type": "Organization", "name": "Kalmeron AI", "url": siteUrl },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={cn(plexArabic.variable, tajawal.variable, plusJakarta.variable, jetBrainsMono.variable)} suppressHydrationWarning>
      <head>
        {/* Performance: pre-warm critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#04060B] text-[#F8FAFC] selection:bg-indigo-500/40">
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
              <LanguageProvider>
                <AuthProvider>
                  <QueryProvider>
                    <IntroPreloader />
                    {children}
                    <CookieBanner />
                    <Toaster position="top-right" richColors />
                    <ServiceWorkerRegistrar />
                    <WebVitals />
                  </QueryProvider>
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

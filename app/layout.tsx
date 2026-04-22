import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic, Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/src/lib/cache/query-client";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/cookie-banner";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { LanguageProvider } from "@/contexts/LanguageContext";

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#080C14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Kalmeron Two | نظام تشغيل رواد الأعمال",
      template: "%s | Kalmeron Two"
    },
    description: "نظام تشغيل لرواد الأعمال يضم 7 أقسام و50+ وكيلاً ذكياً. حوّل فكرتك إلى شركة ناجحة مع شريكك المؤسس الذكي.",
    keywords: [
      "ذكاء اصطناعي", "ريادة أعمال", "مصر", "خطط عمل", "تمويل ناشئ",
      "Kalmeron", "كلميرون", "startup Egypt", "AI business", "مستشار ذكي"
    ],
    manifest: "/manifest.json",
    openGraph: {
      title: "Kalmeron Two | نظام تشغيل رواد الأعمال",
      description: "7 أقسام و50+ وكيلاً ذكياً يعملون كفريقك المؤسس.",
      images: [{ url: "/brand/logo.svg", width: 1200, height: 630, alt: "Kalmeron Two" }],
      locale: "ar_EG",
      type: "website",
      url: siteUrl,
      siteName: "Kalmeron Two",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kalmeron Two | نظام تشغيل رواد الأعمال",
      description: "7 أقسام و50+ وكيلاً ذكياً يعملون كفريقك المؤسس.",
      images: ["/brand/logo.svg"],
    },
    alternates: { canonical: siteUrl },
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
  "name": "Kalmeron Two",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "نظام تشغيل لرواد الأعمال يضم 7 أقسام و50+ وكيلاً ذكياً.",
  "url": siteUrl,
  "image": `${siteUrl}/brand/logo.svg`,
  "inLanguage": "ar",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EGP" },
  "author": { "@type": "Organization", "name": "Kalmeron Two", "url": siteUrl },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={cn(notoKufiArabic.variable, plusJakarta.variable, syne.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#080C14] text-[#F1F5F9]">
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
              <LanguageProvider>
                <AuthProvider>
                  <QueryProvider>
                    {children}
                    <CookieBanner />
                    <Toaster position="top-right" richColors />
                  </QueryProvider>
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

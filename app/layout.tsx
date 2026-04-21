import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
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
});

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Kalmeron AI | شريكك المؤسس الذكي",
      template: "%s | Kalmeron AI"
    },
    description: "حوّل فكرتك إلى شركة تقنية ناجحة مع شريكك المؤسس الذكي. نظام تشغيل يعتمد على الذكاء الاصطناعي لرواد الأعمال المصريين.",
    keywords: [
      "ذكاء اصطناعي", "ريادة أعمال", "مصر", "خطط عمل", "تمويل ناشئ",
      "Kalmeron", "كلميرون", "startup Egypt", "AI business", "مستشار ذكي"
    ],
    manifest: "/manifest.json",
    icons: {
      icon: "/logo.jpg",
      apple: "/logo.jpg",
    },
    openGraph: {
      title: "Kalmeron AI | شريكك المؤسس الذكي",
      description: "ابنِ أثرك مع شريك التكنولوجيا الاستراتيجي في مصر.",
      images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: "Kalmeron AI" }],
      locale: "ar_EG",
      type: "website",
      url: siteUrl,
      siteName: "Kalmeron AI",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kalmeron AI | شريكك المؤسس الذكي",
      description: "ابنِ أثرك مع شريك التكنولوجيا الاستراتيجي في مصر.",
      images: ["/logo.jpg"],
    },
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
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
  "description": "منصة ذكاء اصطناعي لرواد الأعمال المصريين - تحليل الأفكار، بناء خطط العمل، والإرشاد المالي والقانوني.",
  "url": siteUrl,
  "image": `${siteUrl}/logo.jpg`,
  "inLanguage": "ar",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EGP",
  },
  "author": {
    "@type": "Organization",
    "name": "Kalmeron AI",
    "url": siteUrl,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={cn(GeistSans.variable, notoKufiArabic.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#0A0A0F] text-white">
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
              <LanguageProvider>
                <AuthProvider>
                    {children}
                    <CookieBanner />
                    <Toaster position="top-right" richColors />
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

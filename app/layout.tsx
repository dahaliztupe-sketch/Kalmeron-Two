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
  maximumScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Kalmeron AI | شريكك المؤسس الذكي",
      template: "%s | Kalmeron AI"
    },
    description: "حوّل فكرتك إلى شركة تقنية ناجحة مع شريكك المؤسس الذكي. نظام تشغيل يعتمد على الذكاء الاصطناعي.",
    keywords: ["ذكاء اصطناعي", "ريادة أعمال", "مصر", "خطط عمل", "تمويل ناشئ"],
    manifest: "/manifest.json",
    icons: {
      icon: "/logo.jpg",
      apple: "/logo.jpg",
    },
    openGraph: {
      title: "Kalmeron AI | شريكك المؤسس الذكي",
      description: "ابنِ أثرك مع شريك التكنولوجيا الاستراتيجي في مصر.",
      images: ["/logo.jpg"],
      locale: "ar_EG",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={cn(GeistSans.variable, notoKufiArabic.variable)} suppressHydrationWarning>
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

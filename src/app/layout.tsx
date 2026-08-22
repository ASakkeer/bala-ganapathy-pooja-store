import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Hanken_Grotesk, Libre_Caslon_Text, Noto_Sans_Tamil } from "next/font/google";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { AppProviders } from "@/components/ui/app-providers";
import {
  STORE_FAVICON_SRC,
  STORE_LOGO_SRC,
  STORE_NAME,
  STORE_SEO_DESCRIPTION,
  STORE_SEO_KEYWORDS,
  STORE_THEME_COLOR,
} from "@/lib/constants";
import { absoluteUrl, siteOrigin } from "@/lib/site";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-hanken",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  display: "swap",
});

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: STORE_THEME_COLOR,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  applicationName: STORE_NAME,
  title: STORE_NAME,
  description: STORE_SEO_DESCRIPTION,
  keywords: [...STORE_SEO_KEYWORDS],
  authors: [{ name: STORE_NAME, url: absoluteUrl("/") }],
  creator: STORE_NAME,
  publisher: STORE_NAME,
  category: "shopping",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  icons: {
    icon: [{ url: STORE_FAVICON_SRC, type: "image/png" }],
    shortcut: STORE_FAVICON_SRC,
    apple: [{ url: STORE_FAVICON_SRC, type: "image/png" }],
  },
  appleWebApp: {
    title: STORE_NAME,
    statusBarStyle: "default",
    capable: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: absoluteUrl("/"),
    siteName: STORE_NAME,
    title: STORE_NAME,
    description: STORE_SEO_DESCRIPTION,
    images: [{ url: STORE_LOGO_SRC, alt: STORE_NAME }],
  },
  twitter: {
    card: "summary",
    title: STORE_NAME,
    description: STORE_SEO_DESCRIPTION,
    images: [STORE_LOGO_SRC],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${hanken.variable} ${libreCaslon.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface font-sans text-on-surface">
        <AppProviders>
          {children}
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
        </AppProviders>
      </body>
    </html>
  );
}

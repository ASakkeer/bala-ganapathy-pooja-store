import type { Metadata } from "next";
import { Suspense } from "react";
import { Hanken_Grotesk, Libre_Caslon_Text, Noto_Sans_Tamil } from "next/font/google";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { AppProviders } from "@/components/ui/app-providers";
import { STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";
import { siteOrigin } from "@/lib/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: STORE_NAME,
  description:
    "Traditional pooja essentials, homam materials, kumbabishekam requirements, and naattu marundhu from Bala Ganapathy Pooja Store, R.S. Puram, Coimbatore.",
  icons: {
    icon: STORE_LOGO_SRC,
    apple: STORE_LOGO_SRC,
  },
  openGraph: {
    siteName: STORE_NAME,
    images: [{ url: STORE_LOGO_SRC, alt: STORE_NAME }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
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

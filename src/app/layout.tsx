import type { Metadata } from "next";
import { Suspense } from "react";
import { Noto_Sans_Tamil, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";
import { siteOrigin } from "@/lib/site";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
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
      className={`${plusJakarta.variable} ${sourceSerif.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg font-sans text-text">
        {children}
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
      </body>
    </html>
  );
}

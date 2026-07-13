import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartShell } from "@/components/cart-shell";
import { CartProvider } from "@/components/cart-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter, SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WillCommerce",
    template: "%s · WillCommerce",
  },
  description:
    "A blazing-fast Next.js 16.3 ecommerce template with Effect-TS, Instant Navigations, and Better Auth.",
};

/** Lets env(safe-area-inset-*) resolve on notched phones / iOS Safari. */
export const viewport: Viewport = {
  viewportFit: "cover",
};

function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* usePathname suspends for dynamic-param routes under Cache Components */}
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <Suspense
          fallback={
            <CartProvider countReady={false}>
              <AppChrome>{children}</AppChrome>
            </CartProvider>
          }
        >
          <CartShell>
            <AppChrome>{children}</AppChrome>
          </CartShell>
        </Suspense>
      </body>
    </html>
  );
}

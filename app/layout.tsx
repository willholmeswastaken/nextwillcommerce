import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";
import { CartShell } from "@/components/cart-shell";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter, SiteHeader } from "@/components/site-header";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WillCommerce",
    template: "%s · WillCommerce",
  },
  description:
    "Performance kit for after-hours miles. Shop footwear, apparel, and accessories with instant checkout.",
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
      className={`${fraunces.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
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

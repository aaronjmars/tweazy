import "./globals.css";
import Script from "next/script";
import ClientProviders from "../components/ClientProviders";

import { Geist, Geist_Mono } from "next/font/google";

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

export const metadata = {
  title: "Tweazy – The best way to read tweets on-chain",
  description: "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>Tweazy – The best way to read tweets on-chain</title>
        <meta
          name="description"
          content="Query Twitter w/ AI in one click, with x402, MCP & CDP."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tweazy.wtf" />
        <meta
          property="og:title"
          content="Tweazy – The best way to read tweets on-chain"
        />
        <meta
          property="og:description"
          content="Query Twitter w/ AI in one click, with x402, MCP & CDP."
        />
        <meta
          property="og:image"
          content="https://www.tweazy.wtf/og-banner.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.tweazy.wtf" />
        <meta
          name="twitter:title"
          content="Tweazy – The best way to read tweets on-chain"
        />
        <meta
          name="twitter:description"
          content="Query Twitter w/ AI in one click, with x402, MCP & CDP."
        />
        <meta
          name="twitter:image"
          content="https://www.tweazy.wtf/og-banner.png"
        />

        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>

      <body>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="4ce93699-fc9c-4e24-8a4e-a3372ce3e674"
          strategy="afterInteractive"
        />

        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

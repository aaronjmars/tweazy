import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Tweazy - The best way to read tweets onchain</title>
        <meta name="description" content="Query Twitter w/ AI in one click, with x402, MCP & CDP" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1DA1F2" />
        
        {/* Favicon and Icons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tweazy.wtf" />
        <meta property="og:title" content="Tweazy - The best way to read tweets onchain" />
        <meta property="og:description" content="Query Twitter w/ AI in one click, with x402, MCP & CDP." />
        <meta property="og:image" content="https://tweazy.wtf/og-banner.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Tweazy - Query Twitter w/ AI in one click" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.tweazy.wtf" />
        <meta name="twitter:title" content="Tweazy - The best way to read tweets onchain" />
        <meta name="twitter:description" content="Query Twitter w/ AI in one click, with x402, MCP & CDP" />
        <meta name="twitter:image" content="https://tweazy.wtf/og-banner.png" />
        
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="4ce93699-fc9c-4e24-8a4e-a3372ce3e674"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

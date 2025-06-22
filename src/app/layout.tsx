import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";
import { Metadata, Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tweazy.wtf"),
  title: "Tweazy - The best way to read tweets onchain",
  description: "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    url: "https://www.tweazy.wtf",
    type: "website",
    title: "Tweazy - The best way to read tweets onchain",
    description: "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
    images: [
      {
        url: "https://tweazy.wtf/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Tweazy - Query Twitter w/ AI in one click",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tweazy - The best way to read tweets onchain",
    description: "Query Twitter w/ AI in one click, with x402, MCP & CDP",
    images: ["https://tweazy.wtf/og-banner.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1DA1F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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

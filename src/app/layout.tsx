// app/layout.tsx  ⬅️  server component (no "use client")
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProviders from "../components/ClientProviders"; // <-- must be a client component

/* ──────────────────────────────────────────────────────────
   1 Metadata that will be rendered into <head> at build-time
   ────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.tweazy.wtf"),
  title: "Tweazy – The best way to read tweets on-chain",
  description: "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
  openGraph: {
    type: "website",
    url: "/",
    title: "Tweazy – The best way to read tweets on-chain",
    description: "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
    images: ["/og-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tweazy – The best way to read tweets on-chain",
    description: "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
    images: ["/og-banner.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

/* ──────────────────────────────────────────────────────────
   2 Viewport / theme-color now lives in its own export
   ────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: "#1DA1F2",
};

/* ──────────────────────────────────────────────────────────
   3 Root layout – no custom <head>, just render children
   ────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ClientProviders wraps WagmiProvider, QueryClientProvider, … */}
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tweazy.wtf"),
  title: "Tweazy – The best way to read tweets on-chain",
  description:
    "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
  themeColor: "#1DA1F2",
  openGraph: {
    type: "website",
    url: "/",
    title: "Tweazy – The best way to read tweets on-chain",
    description:
      "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
    images: ["/og-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tweazy – The best way to read tweets on-chain",
    description:
      "Query Twitter w/ AI in one click, with x402, MCP & CDP.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

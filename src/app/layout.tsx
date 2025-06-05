import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../lib/wagmiConfig";
import WalletGate from "../components/WalletGate";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WagmiProvider config={wagmiConfig}>
            <WalletGate>
              {children}
            </WalletGate>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

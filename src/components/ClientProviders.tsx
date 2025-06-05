"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../lib/wagmiConfig";
import { ThemeProvider } from "next-themes";
import WalletGate from "./WalletGate";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <WalletGate>
          {children}
        </WalletGate>
      </ThemeProvider>
    </WagmiProvider>
  );
}
"use client";

import { ReactNode, useRef } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../lib/wagmiConfig";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ClientProviders({ children }: { children: ReactNode }) {
  // Ensure QueryClient is only created once per app
  const queryClientRef = useRef<QueryClient>(new QueryClient());

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <WagmiProvider config={wagmiConfig}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
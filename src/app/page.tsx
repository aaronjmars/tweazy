"use client";
import { MessageThreadFull } from "@/components/ui/message-thread-full";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { loadMcpServers } from "@/lib/mcp-utils";
import { components } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { WalletProvider, useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

function WalletInfo() {
  const { walletType, cdpWalletInfo, switchWallet } = useWallet();

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border">
        <Wallet className="h-4 w-4" />
        <span className="text-sm font-medium">
          {walletType === 'metamask' ? 'MetaMask' : 'CDP Wallet'}
        </span>
        {cdpWalletInfo && (
          <span className="text-xs text-muted-foreground">
            {cdpWalletInfo.address.slice(0, 6)}...{cdpWalletInfo.address.slice(-4)}
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={switchWallet}
        className="bg-background/80 backdrop-blur-sm"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

function MainApp() {
  // Load MCP server configurations
  const mcpServers = loadMcpServers();

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <WalletInfo />
      
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
      >
        <TamboMcpProvider mcpServers={mcpServers}>
          <div className="w-full max-w-4xl mx-auto">
            <MessageThreadFull contextKey="tambo-template" />
          </div>
        </TamboMcpProvider>
      </TamboProvider>
    </div>
  );
}

export default function Home() {
  return (
    <WalletProvider>
      <MainApp />
    </WalletProvider>
  );
}

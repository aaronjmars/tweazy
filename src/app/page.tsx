"use client";
import { MessageThreadFull } from "@/components/ui/message-thread-full";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { loadMcpServers } from "@/lib/mcp-utils";
import { components } from "@/lib/tambo";
import { generateUserContextKey } from "@/lib/user-context";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { WalletProvider, useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, RefreshCw, DollarSign, Copy, Check, AlertTriangle } from "lucide-react";
import { useState, useCallback } from "react";
import { useAccount, useBalance } from "wagmi";
import { config } from "@/lib/config";

function WalletInfo() {
  const {
    walletType,
    cdpWalletInfo,
    smartWalletInfo,
    switchWallet,
    isOnCorrectChain,
    switchToCorrectChain,
    balance,
    refreshBalance
  } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // MetaMask wallet info
  const { address: metamaskAddress } = useAccount();
  const { data: metamaskBalance } = useBalance({
    address: metamaskAddress,
    token: config.contracts.usdc as `0x${string}`, // USDC contract address
  });

  const handleRefreshBalance = useCallback(async () => {
    console.log('Refreshing balance for wallet type:', walletType);
    setIsRefreshing(true);
    try {
      await refreshBalance();
      console.log('Balance refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshBalance, walletType]);

  const copyAddress = useCallback(async () => {
    const address = walletType === 'metamask' 
      ? metamaskAddress 
      : smartWalletInfo?.address || cdpWalletInfo?.address;
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
      }
    }
  }, [walletType, metamaskAddress, cdpWalletInfo?.address, smartWalletInfo?.address]);

  const displayBalance = walletType === 'metamask'
    ? metamaskBalance?.formatted || '0'
    : balance || '0';

  const displayAddress = walletType === 'metamask' 
    ? metamaskAddress 
    : smartWalletInfo?.address || cdpWalletInfo?.address;

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
      <ThemeToggle />
      <div className={`flex items-center gap-3 bg-card/95 backdrop-blur-sm rounded-lg px-4 py-2 border shadow-sm ${
        walletType === 'metamask' && !isOnCorrectChain ? 'border-destructive/50' : ''
      }`}>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {walletType === 'metamask'
              ? 'Custodial Wallet'
              : smartWalletInfo
                ? 'Smart Wallet'
                : 'CDP Wallet'}
          </span>
          {walletType === 'metamask' && !isOnCorrectChain && (
            <div 
              className="cursor-pointer" 
              title="Wrong network - click to switch to Base Sepolia"
              onClick={switchToCorrectChain}
            >
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          )}
        </div>
        
        {displayAddress && (
          <div className="flex items-center gap-2 border-l pl-3">
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 text-xs text-muted-foreground font-mono hover:text-foreground transition-colors cursor-pointer group"
              title={isCopied ? "Copied!" : "Click to copy address"}
            >
              <span>
                {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
              </span>
              {isCopied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2 border-l pl-3">
          <DollarSign className="h-3 w-3 text-primary" />
          <span className={`text-sm font-mono text-foreground transition-opacity ${isRefreshing ? 'opacity-50' : ''}`}>
            {parseFloat(displayBalance).toFixed(2)} USDC
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshBalance}
            disabled={isRefreshing}
            className="h-6 w-6 p-0 hover:bg-muted"
            title={isRefreshing ? "Refreshing..." : "Refresh balance"}
          >
            <RefreshCw className={`h-3 w-3 transition-transform ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={switchWallet}
        className="bg-card/95 backdrop-blur-sm"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

function MainApp() {
  // Load MCP server configurations
  const mcpServers = loadMcpServers();
  const { paymentContext, isWalletReady } = useWallet();

  // Create a unique context key based on user's wallet address
  // This ensures each user has their own conversation history
  const contextKey = generateUserContextKey(paymentContext, isWalletReady);

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-background">
      <WalletInfo />

      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
      >
        <TamboMcpProvider mcpServers={mcpServers}>
          <div className="w-full max-w-4xl mx-auto h-full">
            <MessageThreadFull contextKey={contextKey} />
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

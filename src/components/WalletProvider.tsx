'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { WalletSelector } from './WalletSelector';
import { CDPWalletInfo, CDPWalletStorage, fundTestnetWallet } from '@/lib/cdp-wallet';
import { WalletType, PaymentContext } from '@/lib/payment';

interface WalletContextType {
  walletType: WalletType | null;
  paymentContext: PaymentContext | null;
  isWalletReady: boolean;
  isLoading: boolean;
  error: string | null;
  cdpWalletInfo: CDPWalletInfo | null;
  createCDPWallet: () => Promise<void>;
  fundWallet: () => Promise<void>;
  switchWallet: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [cdpWalletInfo, setCdpWalletInfo] = useState<CDPWalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(true);

  // MetaMask wallet connection
  const { address: metamaskAddress, isConnected } = useAccount();

  // Check for existing wallet session on mount
  useEffect(() => {
    const savedWalletType = localStorage.getItem('wallet_type') as WalletType | null;
    const savedCdpWallet = CDPWalletStorage.getWalletSession();

    if (savedWalletType === 'cdp' && savedCdpWallet) {
      setWalletType('cdp');
      setCdpWalletInfo(savedCdpWallet);
      setShowWalletSelector(false);
    } else if (savedWalletType === 'metamask' && isConnected) {
      setWalletType('metamask');
      setShowWalletSelector(false);
    }
  }, [isConnected]);

  const createCDPWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call server-side API to create CDP wallet
      const response = await fetch('/api/cdp/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create CDP wallet');
      }

      const walletInfo: CDPWalletInfo = await response.json();
      setCdpWalletInfo(walletInfo);
      CDPWalletStorage.saveWalletSession(walletInfo);
      
      // Attempt to fund the wallet for testing
      await fundTestnetWallet(walletInfo.address);
      
      setWalletType('cdp');
      localStorage.setItem('wallet_type', 'cdp');
      setShowWalletSelector(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create CDP wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const fundWallet = async () => {
    if (!cdpWalletInfo) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/cdp/fund-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: cdpWalletInfo.address }),
      });

      if (!response.ok) {
        throw new Error('Failed to fund wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fund wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSelect = async (selectedWalletType: WalletType) => {
    setError(null);

    if (selectedWalletType === 'cdp') {
      await createCDPWallet();
    } else if (selectedWalletType === 'metamask') {
      setWalletType('metamask');
      localStorage.setItem('wallet_type', 'metamask');
      setShowWalletSelector(false);
    }
  };

  const switchWallet = () => {
    // Clear all wallet data
    setWalletType(null);
    setCdpWalletInfo(null);
    setError(null);
    CDPWalletStorage.clearWalletSession();
    localStorage.removeItem('wallet_type');
    setShowWalletSelector(true);
  };

  // Determine if wallet is ready for payments
  const isWalletReady = Boolean(
    (walletType === 'metamask' && isConnected && metamaskAddress) ||
    (walletType === 'cdp' && cdpWalletInfo)
  );

  // Create payment context
  const paymentContext: PaymentContext | null = isWalletReady ? {
    walletType: walletType!,
    walletInfo: cdpWalletInfo || undefined,
    userAddress: metamaskAddress || undefined,
  } : null;

  // Show wallet selector if no wallet is selected
  if (showWalletSelector || !walletType) {
    return <WalletSelector onWalletSelect={handleWalletSelect} />;
  }

  // Show wallet connection message for MetaMask if not connected
  if (walletType === 'metamask' && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Connect MetaMask</h1>
          <p className="text-muted-foreground">Please connect your MetaMask wallet to continue</p>
          <button
            onClick={switchWallet}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Choose Different Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <WalletContext.Provider
      value={{
        walletType,
        paymentContext,
        isWalletReady,
        isLoading,
        error,
        cdpWalletInfo,
        createCDPWallet,
        fundWallet,
        switchWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAccount, useChainId, useConnect } from 'wagmi';
import { switchChain } from 'wagmi/actions';
import { wagmiConfig } from '@/lib/wagmiConfig';
import { baseSepolia } from 'wagmi/chains';
import { WalletSelector } from './WalletSelector';
import { CDPWalletInfo, CDPWalletStorage, fundTestnetWallet } from '@/lib/cdp-wallet';
import { SmartWalletInfo, SmartWalletStorage, smartWalletService } from '@/lib/smart-wallet';
import { WalletType, PaymentContext, checkBalance } from '@/lib/payment';
import { config } from '@/lib/config';

interface WalletContextType {
  walletType: WalletType | null;
  paymentContext: PaymentContext | null;
  isWalletReady: boolean;
  isLoading: boolean;
  error: string | null;
  cdpWalletInfo: CDPWalletInfo | null;
  smartWalletInfo: SmartWalletInfo | null;
  balance: string | null;
  lastBalanceUpdate: Date | null;
  createCDPWallet: () => Promise<void>;
  connectSmartWallet: () => Promise<void>;
  fundWallet: () => Promise<void>;
  switchWallet: () => void;
  switchToCorrectChain: () => Promise<boolean>;
  isOnCorrectChain: boolean;
  refreshBalance: () => Promise<void>;
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
  const [smartWalletInfo, setSmartWalletInfo] = useState<SmartWalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(true);
  const [balance, setBalance] = useState<string | null>(null);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date | null>(null);

  // MetaMask wallet connection
  const { address: metamaskAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  
  // Check if user is on the correct chain (Base Sepolia)
  const isOnCorrectChain = chainId === baseSepolia.id;

  // Check for existing wallet session on mount
  useEffect(() => {
    const savedWalletType = localStorage.getItem(config.storage.walletTypeKey);
    const savedCdpWallet = CDPWalletStorage.getWalletSession();
    const savedSmartWallet = SmartWalletStorage.getWalletSession();

    if (savedWalletType === 'cdp' && savedCdpWallet) {
      setWalletType('cdp');
      setCdpWalletInfo(savedCdpWallet);
      setShowWalletSelector(false);
    } else if (savedWalletType === 'smart' && savedSmartWallet) {
      setWalletType('cdp'); // Use cdp type for smart wallets
      setSmartWalletInfo(savedSmartWallet);
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
      localStorage.setItem(config.storage.walletTypeKey, 'cdp');
      setShowWalletSelector(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create CDP wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const connectSmartWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const walletInfo = await smartWalletService.connectWithPasskey();
      setSmartWalletInfo(walletInfo);
      
      setWalletType('cdp'); // Use cdp type for smart wallets
      localStorage.setItem(config.storage.walletTypeKey, 'smart');
      setShowWalletSelector(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect smart wallet');
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
      setIsLoading(true);
      try {
        // Find the custodial wallet connector
        const metamaskConnector = connectors.find(connector => connector.id === 'injected');
        if (!metamaskConnector) {
          throw new Error('Custodial wallet connector not found. Please install a compatible wallet.');
        }

        // Trigger the custodial wallet connection popup
        await connect({ connector: metamaskConnector });

        setWalletType('metamask');
        localStorage.setItem(config.storage.walletTypeKey, 'metamask');
        setShowWalletSelector(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to custodial wallet');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSmartWalletSelect = async () => {
    await connectSmartWallet();
  };

  // Determine if wallet is ready for payments
  const isWalletReady = Boolean(
    (walletType === 'metamask' && isConnected && metamaskAddress && isOnCorrectChain) ||
    (walletType === 'cdp' && (cdpWalletInfo || smartWalletInfo))
  );

  // Create payment context
  const paymentContext: PaymentContext | null = useMemo(() => {
    return isWalletReady ? {
      walletType: walletType!,
      walletInfo: cdpWalletInfo || undefined,
      smartWalletInfo: smartWalletInfo || undefined,
      userAddress: metamaskAddress || undefined,
    } : null;
  }, [isWalletReady, walletType, cdpWalletInfo, smartWalletInfo, metamaskAddress]);

  const refreshBalance = useCallback(async () => {
    if (!paymentContext) return;

    try {
      const currentBalance = await checkBalance(paymentContext);
      setBalance(currentBalance);
      setLastBalanceUpdate(new Date());
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [paymentContext]);

  const switchWallet = () => {
    // Clear all wallet data
    setWalletType(null);
    setCdpWalletInfo(null);
    setSmartWalletInfo(null);
    setError(null);
    setBalance(null);
    setLastBalanceUpdate(null);
    CDPWalletStorage.clearWalletSession();
    SmartWalletStorage.clearWalletSession();
    localStorage.removeItem(config.storage.walletTypeKey);
    setShowWalletSelector(true);
  };

  const switchToCorrectChain = async (): Promise<boolean> => {
    if (walletType !== 'metamask' || !isConnected) {
      return false;
    }

    if (isOnCorrectChain) {
      return true;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await switchChain(wagmiConfig, { chainId: baseSepolia.id });
      return true;
    } catch {
      setError('Failed to switch to Base Sepolia network. Please switch manually in your custodial wallet.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };



  // Auto-refresh balance every minute and when wallet becomes ready
  useEffect(() => {
    if (!isWalletReady || !paymentContext) return;

    // Initial balance fetch
    refreshBalance();

    // Set up interval for automatic refresh every minute
    const interval = setInterval(() => {
      refreshBalance();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isWalletReady, paymentContext, refreshBalance]);

  // Show wallet selector if no wallet is selected
  if (showWalletSelector || !walletType) {
    return <WalletSelector onWalletSelect={handleWalletSelect} onSmartWalletSelect={handleSmartWalletSelect} />;
  }

  // Show wallet connection message for MetaMask if not connected
  if (walletType === 'metamask' && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Connect Custodial Wallet</h1>
          <p className="text-muted-foreground">Please connect your custodial wallet to continue</p>
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

  // Show chain switching message for MetaMask if on wrong chain
  if (walletType === 'metamask' && isConnected && !isOnCorrectChain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Switch Network</h1>
          <p className="text-muted-foreground">
            Please switch to {config.chains.baseSepolia.displayName} network to continue. Current network is not supported.
          </p>
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={switchToCorrectChain}
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Switching...' : `Switch to ${config.chains.baseSepolia.displayName}`}
            </button>
            <button
              onClick={switchWallet}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
            >
              Choose Different Wallet
            </button>
          </div>
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
        smartWalletInfo,
        balance,
        lastBalanceUpdate,
        createCDPWallet,
        connectSmartWallet,
        fundWallet,
        switchWallet,
        switchToCorrectChain,
        isOnCorrectChain,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
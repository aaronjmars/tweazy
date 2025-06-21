/**
 * @file smart-wallet.ts
 * @description Coinbase Smart Wallet service with passkey authentication
 */

import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { config, configUtils } from './config';

// Extended wallet info for smart wallets
export interface SmartWalletInfo {
  id: string;
  address: string;
  network: string;
  balance?: string;
  isSmartWallet: true;
  passkeyId?: string;
}

// Smart wallet configuration
const SMART_WALLET_CONFIG = {
  appName: config.app.name,
  appLogoUrl: config.app.logoUrl,
  appChainIds: [config.network.chainId],
  smartWallet: {
    enabled: true
  }
};

interface EthereumProvider {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
}

class SmartWalletService {
  private sdk: ReturnType<typeof createCoinbaseWalletSDK> | null = null;
  private provider: EthereumProvider | null = null;

  private initializeSDK() {
    if (!this.sdk) {
      this.sdk = createCoinbaseWalletSDK(SMART_WALLET_CONFIG);
      this.provider = this.sdk.getProvider() as EthereumProvider;
    }
    return { sdk: this.sdk, provider: this.provider };
  }

  async connectWithPasskey(): Promise<SmartWalletInfo> {
    try {
      // Clear any existing stored wallet data first
      SmartWalletStorage.clearWalletSession();
      
      const { provider } = this.initializeSDK();
      
      if (!provider) {
        throw new Error('Failed to initialize smart wallet provider');
      }

      // Try to connect with passkey
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from smart wallet');
      }

      const address = accounts[0];
      
      // Validate the address
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        throw new Error('Invalid address returned from smart wallet provider');
      }
      
      // Get network info
      const chainId = await provider.request({ method: 'eth_chainId' }) as string;
      const network = this.getNetworkName(chainId);

      // Create wallet info
      const walletInfo: SmartWalletInfo = {
        id: `smart-wallet-${address}`,
        address,
        network,
        isSmartWallet: true,
        passkeyId: address // Use address as passkey identifier for now
      };

      // Save to storage
      SmartWalletStorage.saveWalletSession(walletInfo);
      
      return walletInfo;
    } catch (error) {
      throw new Error(`Failed to connect smart wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBalance(walletInfo: SmartWalletInfo): Promise<string> {
    try {
      // Check if the wallet address is the same as USDC contract (this shouldn't happen)
      const usdcContract = config.contracts.usdc;
      if (walletInfo.address.toLowerCase() === usdcContract.toLowerCase()) {
        // ERROR: Smart wallet address is the same as USDC contract address!
        // This indicates a problem with wallet creation/connection
        return '0';
      }
      
      // Try using direct RPC call to current network instead of wallet provider
      try {
        const response = await fetch(config.network.fallbackRpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: usdcContract,
              data: '0x70a08231' + walletInfo.address.slice(2).toLowerCase().padStart(64, '0')
            }, 'latest'],
            id: 1
          })
        });

        const data = await response.json();

        if (data.result && data.result !== '0x' && data.result !== '0x0') {
          const balanceWei = BigInt(data.result);
          const balanceUsdc = Number(balanceWei) / Math.pow(10, 6);
          return balanceUsdc.toString();
        } else {
          // Direct RPC returned zero balance or empty result
        }
      } catch {
        // Direct RPC call failed
      }

      // Fallback to wallet provider method
      const { provider } = this.initializeSDK();
      
      if (!provider) {
        throw new Error('Failed to initialize smart wallet provider');
      }
      
      // ERC-20 balanceOf function signature
      const walletAddressHex = walletInfo.address.slice(2).toLowerCase().padStart(64, '0');
      const balanceOfData = '0x70a08231' + walletAddressHex;
      
      const balance = await provider.request({
        method: 'eth_call',
        params: [{
          to: usdcContract,
          data: balanceOfData
        }, 'latest']
      }) as string;

      // Convert from wei to USDC (6 decimals)
      if (!balance || balance === '0x' || balance === '0x0') {
        return '0';
      }

      const balanceWei = BigInt(balance);
      const balanceUsdc = Number(balanceWei) / Math.pow(10, 6);
      
      return balanceUsdc.toString();
    } catch {
      return '0';
    }
  }

  async transferUSDC(
    walletInfo: SmartWalletInfo, 
    recipient: string, 
    amount: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string; }> {
    try {
      const { provider } = this.initializeSDK();
      
      if (!provider) {
        throw new Error('Failed to initialize smart wallet provider');
      }
      
      const usdcContract = config.contracts.usdc;
      const decimals = config.payment.usdcDecimals;
      const amountWei = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
      
      // ERC-20 transfer function signature
      const transferData = '0xa9059cbb' + 
        recipient.slice(2).padStart(64, '0') + 
        amountWei.toString(16).padStart(64, '0');

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletInfo.address,
          to: usdcContract,
          data: transferData,
          gas: configUtils.gasToHex(config.gas.defaultLimit),
        }]
      }) as string;

      return {
        success: true,
        transactionHash: txHash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.provider) {
        await this.provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        });
      }
      SmartWalletStorage.clearWalletSession();
    } catch {
    }
  }

  private getNetworkName(chainId: string): string {
    const chainIdNum = parseInt(chainId, 16);
    return configUtils.getNetworkNameById(chainIdNum);
  }

  isConnected(): boolean {
    return SmartWalletStorage.getWalletSession() !== null;
  }

  getStoredWallet(): SmartWalletInfo | null {
    return SmartWalletStorage.getWalletSession();
  }
}

// Storage for smart wallet sessions
class SmartWalletStorage {
  private static get STORAGE_KEY(): string {
    return config.storage.smartWalletKey;
  }

  static saveWalletSession(walletInfo: SmartWalletInfo): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(walletInfo));
    }
  }

  static getWalletSession(): SmartWalletInfo | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          this.clearWalletSession();
        }
      }
    }
    return null;
  }

  static clearWalletSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

// Create singleton instance
export const smartWalletService = new SmartWalletService();
export { SmartWalletStorage };

// Helper to check if smart wallet is available
export function isSmartWalletAvailable(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'credentials' in navigator;
}
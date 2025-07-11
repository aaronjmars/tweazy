/**
 * @file cdp-wallet.ts
 * @description Coinbase CDP wallet service for creating and managing wallets
 */

import { config } from './config';

export interface CDPWalletInfo {
  id: string;
  address: string;
  network: string;
  balance?: string;
}

export interface CDPWalletService {
  createWallet(): Promise<CDPWalletInfo>;
  getBalance(walletId: string): Promise<string>;
  transferUSDC(walletId: string, recipient: string, amount: string): Promise<{ success: boolean; transactionHash?: string; error?: string; }>;
}

class CDPWalletServiceImpl implements CDPWalletService {
  async createWallet(): Promise<CDPWalletInfo> {
    try {
      const response = await fetch(`${config.api.baseUrl}/cdp/create-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create CDP wallet');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create CDP wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBalance(walletId: string): Promise<string> {
    try {
      const response = await fetch(`${config.api.baseUrl}/cdp/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get balance');
      }

      const { balance } = await response.json();
      return balance;
    } catch {
      return '0';
    }
  }

  async transferUSDC(walletId: string, recipient: string, amount: string): Promise<{ success: boolean; transactionHash?: string; error?: string; }> {
    try {
      const response = await fetch(`${config.api.baseUrl}/cdp/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletId, recipient, amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Transfer failed',
        };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed',
      };
    }
  }
}

// Storage for wallet sessions
class CDPWalletStorage {
  private static get STORAGE_KEY(): string {
    return config.storage.cdpWalletKey;
  }

  static saveWalletSession(walletInfo: CDPWalletInfo): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(walletInfo));
    }
  }

  static getWalletSession(): CDPWalletInfo | null {
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
export const cdpWalletService = new CDPWalletServiceImpl();
export { CDPWalletStorage };

// Wallet funding helper for testnet
export async function fundTestnetWallet(walletAddress: string): Promise<boolean> {
  try {
    const response = await fetch(`${config.api.baseUrl}/cdp/fund-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

// Helper to check if CDP wallet is available
export function isCDPWalletAvailable(): boolean {
  // Since we're using API routes, this is always available on the client
  return true;
}
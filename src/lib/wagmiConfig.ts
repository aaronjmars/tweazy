import { http, createConfig } from 'wagmi';
import { mainnet, baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// USDC contract address on Base Sepolia testnet
export const USDC_BASE_SEPOLIA_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

// Chain configuration constants
export const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id;
export const BASE_MAINNET_CHAIN_ID = 8453; // Base mainnet

// Paymaster configuration
export const PAYMASTER_CONFIG = {
  url: process.env.NEXT_PUBLIC_PAYMASTER_URL || '/api/paymaster',
  supportedChains: [BASE_SEPOLIA_CHAIN_ID, BASE_MAINNET_CHAIN_ID],
} as const;

export const wagmiConfig = createConfig({
  chains: [baseSepolia, mainnet], // Prioritize Base Sepolia
  connectors: [
    injected({
      target: 'metaMask',
    }),
    coinbaseWallet({
      appName: 'MCP x402 Payment System',
      appLogoUrl: 'https://your-app.com/logo.png',
      preference: 'smartWalletOnly', // Force smart wallet usage
    }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
    [mainnet.id]: http(),
  },
  ssr: true,
});

// Helper function to check if paymaster is supported for a given chain
export function isPaymasterSupported(chainId: number): boolean {
  return PAYMASTER_CONFIG.supportedChains.includes(chainId as 84532 | 8453);
}

// Helper function to get paymaster URL
export function getPaymasterUrl(): string {
  return PAYMASTER_CONFIG.url;
}
import { http, createConfig } from 'wagmi';
import { mainnet, baseSepolia, base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { config, configUtils } from './config';

// USDC contract address (configurable per network)
export const USDC_BASE_SEPOLIA_ADDRESS = config.contracts.usdc as `0x${string}`;

// Chain configuration constants
export const BASE_SEPOLIA_CHAIN_ID = config.chains.baseSepolia.id;
export const BASE_MAINNET_CHAIN_ID = config.chains.baseMainnet.id;

// Paymaster configuration
export const PAYMASTER_CONFIG = {
  url: config.api.paymasterUrl,
  supportedChains: [BASE_SEPOLIA_CHAIN_ID, BASE_MAINNET_CHAIN_ID],
  callGasLimit: config.gas.paymaster.callGasLimit,
  verificationGasLimit: config.gas.paymaster.verificationGasLimit,
  preVerificationGas: config.gas.paymaster.preVerificationGas,
  maxFeePerGas: config.gas.paymaster.maxFeePerGas,
  maxPriorityFeePerGas: config.gas.paymaster.maxPriorityFeePerGas,
} as const;

// Support all chains but prioritize based on network mode in the UI
// This allows wagmi to work with all chains while the app logic handles network-specific behavior

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base, mainnet],
  connectors: [
    // Support all injected wallets (MetaMask, Rabby, Coinbase Wallet, etc.)
    injected(), // Generic injected connector for all wallets
  ],
  transports: {
    [baseSepolia.id]: http(config.networks.testnet.rpcUrl),
    [base.id]: http(config.networks.mainnet.rpcUrl),
    [mainnet.id]: http(),
  },
  ssr: true,
});

// Helper function to check if paymaster is supported for a given chain
export function isPaymasterSupported(chainId: number): boolean {
  return configUtils.isPaymasterSupported(chainId);
}

// Helper function to get paymaster URL
export function getPaymasterUrl(): string {
  return config.api.paymasterUrl;
}
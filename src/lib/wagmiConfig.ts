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

// Get chains based on network mode
const getChains = () => {
  const chains = [mainnet]; // Always include mainnet for fallback
  
  if (config.network.mode === 'testnet') {
    chains.unshift(baseSepolia); // Prioritize testnet
  } else {
    chains.unshift(base); // Prioritize mainnet
  }
  
  return chains;
};

// Get transports based on network mode
const getTransports = () => {
  const transports: Record<number, ReturnType<typeof http>> = {
    [mainnet.id]: http(),
  };
  
  if (config.network.mode === 'testnet') {
    transports[baseSepolia.id] = http(config.network.rpcUrl);
  } else {
    transports[base.id] = http(config.network.rpcUrl);
  }
  
  return transports;
};

export const wagmiConfig = createConfig({
  chains: getChains(),
  connectors: [
    // Support all injected wallets (MetaMask, Rabby, Coinbase Wallet, etc.)
    injected(), // Generic injected connector for all wallets
  ],
  transports: getTransports(),
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
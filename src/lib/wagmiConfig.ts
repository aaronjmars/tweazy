import { http, createConfig } from 'wagmi';
import { mainnet, baseSepolia } from 'wagmi/chains';
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

export const wagmiConfig = createConfig({
  chains: [baseSepolia, mainnet], // Prioritize Base Sepolia
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(config.rpc.baseSepoliaUrl),
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
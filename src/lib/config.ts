/**
 * @file config.ts
 * @description Centralized configuration with network-specific settings
 * This file contains all non-secret configuration with easy testnet/mainnet switching
 * Secrets are kept in environment variables only
 */

// Network mode from environment (defaults to testnet for safety).
// A cast here would let a typo'd value index NETWORK_CONFIGS as undefined and take
// the whole app down; anything that isn't exactly 'mainnet' falls back to testnet.
const NETWORK_MODE: 'testnet' | 'mainnet' =
  process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' ? 'mainnet' : 'testnet';

// Network-specific configurations
const NETWORK_CONFIGS = {
  testnet: {
    // Base Sepolia (Testnet)
    chainId: 84532,
    name: 'base-sepolia',
    displayName: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    fallbackRpcUrl: 'https://sepolia.base.org',
    usdcContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    cdpNetwork: 'base-sepolia',
    testnetNotice: 'Base Sepolia testnet only • No real funds required • Secure & Private',
    isTestnet: true,
  },
  mainnet: {
    // Base Mainnet (Production)
    chainId: 8453,
    name: 'base-mainnet',
    displayName: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    fallbackRpcUrl: 'https://base.llamarpc.com',
    usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    // CDP's network vocabulary calls Base mainnet 'base', not 'base-mainnet'.
    cdpNetwork: 'base',
    testnetNotice: '',
    isTestnet: false,
  },
} as const;

const APP_CONSTANTS = {
  name: 'Tweazy',
  logoUrl: 'https://tweazy.wtf/icon.png',

  // Payment Configuration
  defaultPaymentAmount: '0.01',
  usdcDecimals: 6,

  // Gas Configuration (conservative defaults)
  gas: {
    defaultLimit: 21000,
  },

  // API Configuration
  api: {
    baseUrl: '/api',
  },

  // Storage Configuration (hardcoded for consistency)
  storage: {
    walletTypeKey: 'wallet_type',
    cdpWalletKey: 'cdp_wallet_session',
    smartWalletKey: 'smart_wallet_session',
  },

  // Testing Configuration
  testing: {
    mockWalletBalance: '100.0',
  },
} as const;

// Get current network configuration
const currentNetwork = NETWORK_CONFIGS[NETWORK_MODE];

/**
 * Main configuration object with network-aware settings
 */
export const config = {
  // Application Configuration
  app: APP_CONSTANTS,

  // Current Network Configuration
  network: {
    mode: NETWORK_MODE,
    ...currentNetwork,
  },

  // All Networks (for switching)
  networks: NETWORK_CONFIGS,

  // Payment Configuration (requires environment variable)
  payment: {
    defaultAmount: APP_CONSTANTS.defaultPaymentAmount,
    usdcDecimals: APP_CONSTANTS.usdcDecimals,
    recipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '', // Required secret
  },

  // Gas Configuration
  gas: APP_CONSTANTS.gas,

  // API Configuration
  api: APP_CONSTANTS.api,

  // Storage Configuration
  storage: APP_CONSTANTS.storage,

  // Testing Configuration
  testing: {
    ...APP_CONSTANTS.testing,
    testnetNotice: currentNetwork.testnetNotice,
  },

  // Legacy chain configuration (for backward compatibility)
  chains: {
    baseSepolia: {
      id: NETWORK_CONFIGS.testnet.chainId,
      name: NETWORK_CONFIGS.testnet.name,
      displayName: NETWORK_CONFIGS.testnet.displayName,
    },
    baseMainnet: {
      id: NETWORK_CONFIGS.mainnet.chainId,
      name: NETWORK_CONFIGS.mainnet.name,
      displayName: NETWORK_CONFIGS.mainnet.displayName,
    },
  },
} as const;

/**
 * Utility functions for common config operations
 */
export const configUtils = {
  /**
   * Get chain config by chain ID
   */
  getChainById: (chainId: number) => {
    if (chainId === config.chains.baseSepolia.id) return config.chains.baseSepolia;
    if (chainId === config.chains.baseMainnet.id) return config.chains.baseMainnet;
    return null;
  },

  /**
   * Get network name by chain ID
   */
  getNetworkNameById: (chainId: number) => {
    const chain = configUtils.getChainById(chainId);
    return chain?.name || 'unknown';
  },

  /**
   * Convert gas limit to hex string
   */
  gasToHex: (gasLimit: number) => '0x' + gasLimit.toString(16),
};

/**
 * Type-safe environment variable checker
 */
export const envChecker = {
  /**
   * Check if CDP environment variables are configured
   */
  isCDPConfigured: () => {
    return !!(
      process.env.CDP_API_KEY_NAME &&
      process.env.CDP_API_KEY_PRIVATE_KEY &&
      process.env.CDP_WALLET_SECRET
    );
  },
};
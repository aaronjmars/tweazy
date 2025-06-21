/**
 * @file config.ts
 * @description Centralized configuration with encoded default values
 * This file contains all configurable constants with sensible defaults
 * for non-secret information to ensure the app works even without env vars
 */

// Default configuration constants (non-secret only)
const DEFAULT_CONFIG = {
  // Application Configuration
  APP_NAME: 'Tweazy',
  APP_LOGO_URL: 'https://tweazy.com/logo.png',

  // Chain Configuration
  BASE_SEPOLIA_CHAIN_ID: 84532,
  BASE_MAINNET_CHAIN_ID: 8453,
  DEFAULT_NETWORK: 'base-sepolia',
  NETWORK_DISPLAY_NAME: 'Base Sepolia',

  // RPC Configuration
  BASE_SEPOLIA_RPC_URL: 'https://sepolia.base.org',
  BASE_SEPOLIA_FALLBACK_RPC_URL: 'https://sepolia.base.org',

  // Contract Addresses
  USDC_CONTRACT_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',

  // Payment Configuration
  DEFAULT_PAYMENT_AMOUNT: '0.1',
  USDC_DECIMALS: 6,

  // Gas Configuration
  DEFAULT_GAS_LIMIT: 21000,
  PAYMASTER_CALL_GAS_LIMIT: 30000,
  PAYMASTER_VERIFICATION_GAS_LIMIT: 30000,
  PAYMASTER_PRE_VERIFICATION_GAS: 21000,
  MAX_FEE_PER_GAS: 1500000000, // 1.5 gwei
  MAX_PRIORITY_FEE_PER_GAS: 1500000000, // 1.5 gwei

  // API Configuration
  API_BASE_URL: '/api',
  PAYMASTER_URL: '/api/paymaster',

  // Storage Configuration
  WALLET_TYPE_STORAGE_KEY: 'wallet_type',
  CDP_WALLET_STORAGE_KEY: 'cdp_wallet_session',
  SMART_WALLET_STORAGE_KEY: 'smart_wallet_session',

  // Testing Configuration
  MOCK_WALLET_BALANCE: '100.0',
  TESTNET_NOTICE: 'Base Sepolia testnet only • No real funds required • Secure & Private',

  // CDP Network Configuration
  CDP_NETWORK: 'base-sepolia',
} as const;

/**
 * Configuration object that pulls from environment variables with fallbacks
 */
export const config = {
  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_CONFIG.APP_NAME,
    logoUrl: process.env.NEXT_PUBLIC_APP_LOGO_URL || DEFAULT_CONFIG.APP_LOGO_URL,
  },

  // Chain Configuration
  chains: {
    baseSepolia: {
      id: parseInt(process.env.NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID || DEFAULT_CONFIG.BASE_SEPOLIA_CHAIN_ID.toString()),
      name: 'base-sepolia',
      displayName: process.env.NEXT_PUBLIC_NETWORK_DISPLAY_NAME || DEFAULT_CONFIG.NETWORK_DISPLAY_NAME,
    },
    baseMainnet: {
      id: parseInt(process.env.NEXT_PUBLIC_BASE_MAINNET_CHAIN_ID || DEFAULT_CONFIG.BASE_MAINNET_CHAIN_ID.toString()),
      name: 'base-mainnet',
      displayName: 'Base Mainnet',
    },
    default: process.env.NEXT_PUBLIC_DEFAULT_NETWORK || DEFAULT_CONFIG.DEFAULT_NETWORK,
  },

  // RPC Configuration
  rpc: {
    baseSepoliaUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || DEFAULT_CONFIG.BASE_SEPOLIA_RPC_URL,
    baseSepoliaFallbackUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_FALLBACK_RPC_URL || DEFAULT_CONFIG.BASE_SEPOLIA_FALLBACK_RPC_URL,
  },

  // Contract Addresses
  contracts: {
    usdc: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || DEFAULT_CONFIG.USDC_CONTRACT_ADDRESS,
  },

  // Payment Configuration
  payment: {
    defaultAmount: process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_AMOUNT || DEFAULT_CONFIG.DEFAULT_PAYMENT_AMOUNT,
    usdcDecimals: parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || DEFAULT_CONFIG.USDC_DECIMALS.toString()),
    recipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '', // This should be provided
  },

  // Gas Configuration
  gas: {
    defaultLimit: parseInt(process.env.NEXT_PUBLIC_DEFAULT_GAS_LIMIT || DEFAULT_CONFIG.DEFAULT_GAS_LIMIT.toString()),
    paymaster: {
      callGasLimit: parseInt(process.env.NEXT_PUBLIC_PAYMASTER_CALL_GAS_LIMIT || DEFAULT_CONFIG.PAYMASTER_CALL_GAS_LIMIT.toString()),
      verificationGasLimit: parseInt(process.env.NEXT_PUBLIC_PAYMASTER_VERIFICATION_GAS_LIMIT || DEFAULT_CONFIG.PAYMASTER_VERIFICATION_GAS_LIMIT.toString()),
      preVerificationGas: parseInt(process.env.NEXT_PUBLIC_PAYMASTER_PRE_VERIFICATION_GAS || DEFAULT_CONFIG.PAYMASTER_PRE_VERIFICATION_GAS.toString()),
      maxFeePerGas: parseInt(process.env.NEXT_PUBLIC_MAX_FEE_PER_GAS || DEFAULT_CONFIG.MAX_FEE_PER_GAS.toString()),
      maxPriorityFeePerGas: parseInt(process.env.NEXT_PUBLIC_MAX_PRIORITY_FEE_PER_GAS || DEFAULT_CONFIG.MAX_PRIORITY_FEE_PER_GAS.toString()),
    },
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_CONFIG.API_BASE_URL,
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || DEFAULT_CONFIG.PAYMASTER_URL,
  },

  // Storage Configuration
  storage: {
    walletTypeKey: process.env.NEXT_PUBLIC_WALLET_TYPE_STORAGE_KEY || DEFAULT_CONFIG.WALLET_TYPE_STORAGE_KEY,
    cdpWalletKey: process.env.NEXT_PUBLIC_CDP_WALLET_STORAGE_KEY || DEFAULT_CONFIG.CDP_WALLET_STORAGE_KEY,
    smartWalletKey: process.env.NEXT_PUBLIC_SMART_WALLET_STORAGE_KEY || DEFAULT_CONFIG.SMART_WALLET_STORAGE_KEY,
  },

  // Testing Configuration
  testing: {
    mockWalletBalance: process.env.NEXT_PUBLIC_MOCK_WALLET_BALANCE || DEFAULT_CONFIG.MOCK_WALLET_BALANCE,
    testnetNotice: process.env.NEXT_PUBLIC_TESTNET_NOTICE || DEFAULT_CONFIG.TESTNET_NOTICE,
  },

  // CDP Configuration
  cdp: {
    network: process.env.NEXT_PUBLIC_CDP_NETWORK || DEFAULT_CONFIG.CDP_NETWORK,
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

  /**
   * Check if paymaster is supported for chain
   */
  isPaymasterSupported: (chainId: number) => {
    return chainId === config.chains.baseSepolia.id || chainId === config.chains.baseMainnet.id;
  },

  /**
   * Get full API endpoint URL
   */
  getApiEndpoint: (endpoint: string) => `${config.api.baseUrl}${endpoint}`,
};

/**
 * Type-safe environment variable checker
 */
export const envChecker = {
  /**
   * Check if required environment variables are set
   */
  checkRequired: () => {
    const missing: string[] = [];
    
    if (!process.env.NEXT_PUBLIC_TAMBO_API_KEY) {
      missing.push('NEXT_PUBLIC_TAMBO_API_KEY');
    }
    
    if (!config.payment.recipient) {
      missing.push('NEXT_PUBLIC_PAYMENT_RECIPIENT');
    }
    
    return {
      isValid: missing.length === 0,
      missing,
    };
  },

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

export default config;
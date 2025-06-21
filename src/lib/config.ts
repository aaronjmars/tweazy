/**
 * @file config.ts
 * @description Centralized configuration with network-specific settings
 * This file contains all non-secret configuration with easy testnet/mainnet switching
 * Secrets are kept in environment variables only
 */

// Network mode from environment (defaults to testnet for safety)
const NETWORK_MODE = (process.env.NEXT_PUBLIC_NETWORK_MODE || 'testnet') as 'testnet' | 'mainnet';

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
    cdpNetwork: 'base-mainnet',
    testnetNotice: '',
    isTestnet: false,
  },
} as const;

// Application constants (non-network specific)
const APP_CONSTANTS = {
  // Application Configuration
  name: 'MCP x402 Payment System',
  logoUrl: 'https://your-app.com/logo.png',

  // Payment Configuration
  defaultPaymentAmount: '0.1',
  usdcDecimals: 6,

  // Gas Configuration (conservative defaults)
  gas: {
    defaultLimit: 21000,
    paymaster: {
      callGasLimit: 30000,
      verificationGasLimit: 30000,
      preVerificationGas: 21000,
      maxFeePerGas: 1500000000, // 1.5 gwei
      maxPriorityFeePerGas: 1500000000, // 1.5 gwei
    },
  },

  // API Configuration
  api: {
    baseUrl: '/api',
    paymasterUrl: '/api/paymaster',
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
    default: currentNetwork.name,
  },

  // Legacy RPC configuration (for backward compatibility)
  rpc: {
    baseSepoliaUrl: NETWORK_CONFIGS.testnet.rpcUrl,
    baseSepoliaFallbackUrl: NETWORK_CONFIGS.testnet.fallbackRpcUrl,
  },

  // Legacy contract configuration (for backward compatibility)
  contracts: {
    usdc: currentNetwork.usdcContract,
  },

  // Legacy CDP configuration (for backward compatibility)
  cdp: {
    network: currentNetwork.cdpNetwork,
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
   * Get network config by chain ID
   */
  getNetworkByChainId: (chainId: number) => {
    if (chainId === NETWORK_CONFIGS.testnet.chainId) return NETWORK_CONFIGS.testnet;
    if (chainId === NETWORK_CONFIGS.mainnet.chainId) return NETWORK_CONFIGS.mainnet;
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

  /**
   * Check if current network is testnet
   */
  isTestnet: () => config.network.isTestnet,

  /**
   * Check if current network is mainnet
   */
  isMainnet: () => !config.network.isTestnet,

  /**
   * Get contract address for current network
   */
  getCurrentUSDCContract: () => config.network.usdcContract,

  /**
   * Get RPC URL for current network
   */
  getCurrentRpcUrl: () => config.network.rpcUrl,

  /**
   * Get fallback RPC URL for current network
   */
  getCurrentFallbackRpcUrl: () => config.network.fallbackRpcUrl,
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

  /**
   * Get current network mode
   */
  getNetworkMode: () => NETWORK_MODE,

  /**
   * Check if running in production mode
   */
  isProduction: () => NETWORK_MODE === 'mainnet',

  /**
   * Check if running in development mode
   */
  isDevelopment: () => NETWORK_MODE === 'testnet',
};

/**
 * Network switching utilities
 */
export const networkUtils = {
  /**
   * Get configuration for a specific network
   */
  getNetworkConfig: (mode: 'testnet' | 'mainnet') => NETWORK_CONFIGS[mode],

  /**
   * Get all available networks
   */
  getAllNetworks: () => NETWORK_CONFIGS,

  /**
   * Check if a chain ID is supported
   */
  isSupportedChainId: (chainId: number) => {
    return chainId === NETWORK_CONFIGS.testnet.chainId ||
           chainId === NETWORK_CONFIGS.mainnet.chainId;
  },

  /**
   * Get network mode by chain ID
   */
  getNetworkModeByChainId: (chainId: number): 'testnet' | 'mainnet' | null => {
    if (chainId === NETWORK_CONFIGS.testnet.chainId) return 'testnet';
    if (chainId === NETWORK_CONFIGS.mainnet.chainId) return 'mainnet';
    return null;
  },
};

export default config;
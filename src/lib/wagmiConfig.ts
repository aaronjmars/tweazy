import { http, createConfig } from 'wagmi';
import { mainnet, baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// USDC contract address on Base Sepolia testnet
export const USDC_BASE_SEPOLIA_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

export const wagmiConfig = createConfig({
  chains: [mainnet, baseSepolia],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
  },
  ssr: true,
});
import { http, createConfig } from "wagmi";
import { mainnet, baseSepolia, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { config } from "./config";

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

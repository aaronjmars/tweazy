# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at localhost:3000
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting
- `npx tambo init` - Initialize Tambo configuration and create .env.local

## Architecture

This is a Next.js application built with Tambo AI for generative UI and Model Context Protocol (MCP) integration, featuring x402 HTTP payment-gated functionality with triple wallet support including Smart Wallets with passkey authentication.

### Core Structure

- **Tambo Integration**: Uses `@tambo-ai/react` for AI-driven component generation and MCP server communication
- **Payment System**: Implements x402 (HTTP 402 Payment Required) using testnet USDC payments
- **Triple Wallet Support**: Supports Smart Wallets with passkeys, MetaMask (Base Sepolia), and Coinbase CDP (Base Sepolia)
- **Passkey Authentication**: Biometric authentication using Coinbase Smart Wallets for enhanced security

### Key Components

**UI Components** (`src/components/ui/`):
- `Graph` - Recharts-based visualization component (bar, line, pie charts)
- `DataCard` - List display component for selectable information
- Components are registered in `src/lib/tambo.ts` with Zod schemas for AI control

**Payment Infrastructure**:
- `src/lib/payment.ts` - Universal payment system supporting all wallet types (MetaMask, CDP, Smart Wallets)
- `src/lib/smart-wallet.ts` - Coinbase Smart Wallet service with passkey authentication
- `src/lib/cdp-wallet.ts` - Coinbase CDP wallet service with API integration
- `src/lib/x402.ts` - x402 response handling and payment flow orchestration  
- `src/components/PaymentModal.tsx` - Payment confirmation UI
- `src/components/WalletProvider.tsx` - Multi-wallet selection and management context
- `src/components/WalletSelector.tsx` - Wallet type selection UI with Smart Wallet prominence

**Core Libraries**:
- `src/lib/tambo.ts` - Central Tambo component and tool registration
- `src/lib/wagmiConfig.ts` - Ethereum wallet configuration
- `src/lib/mcp-utils.ts` - MCP server utilities

### MCP Configuration

- MCP servers are configured at `/mcp-config` route
- Configuration stored in browser localStorage
- Supports SSE and HTTP MCP servers
- Context7 MCP server integration for search functionality requiring payments

### Triple Wallet System

**Wallet Selection**: Users choose between Smart Wallet (with passkeys), MetaMask, or Coinbase CDP on first launch
- **Smart Wallet**: Uses Coinbase Wallet SDK with passkey authentication (most secure, no seed phrases)
- **MetaMask**: Uses Base Sepolia testnet with wagmi/viem integration  
- **CDP**: Uses Base Sepolia testnet with server-side API integration

**CDP Integration**: Server-side API routes handle CDP operations:
- `/api/cdp/create-wallet` - Creates new CDP wallets
- `/api/cdp/balance` - Checks USDC balance
- `/api/cdp/transfer` - Executes USDC transfers
- `/api/cdp/fund-wallet` - Funds wallets for testing

### x402 Payment Flow

1. User triggers API call requiring payment (e.g., search queries)
2. If x402 response received, payment modal displays
3. User confirms 0.1 USDC payment (all wallets use Base Sepolia network)
4. Payment executed through selected wallet (Smart Wallet with passkey, MetaMask, or CDP)
5. After successful payment, original request retries automatically
6. Payment validation uses transaction hashes

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_TAMBO_API_KEY` - Tambo API key from tambo.co/dashboard
- `NEXT_PUBLIC_CONTEXT7_MCP_URL` - Context7 MCP server URL
- `NEXT_PUBLIC_PAYMENT_RECIPIENT` - Ethereum address for receiving payments
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` - Base Sepolia testnet RPC endpoint
- `CDP_API_KEY_NAME` - Coinbase CDP API key name
- `CDP_API_KEY_PRIVATE_KEY` - Coinbase CDP private key
- `CDP_PROJECT_ID` - Coinbase CDP project ID
- `NEXT_PUBLIC_CDP_NETWORK` - CDP network (base-sepolia for testing)

### Testing

The triple wallet x402 payment system supports:

**Smart Wallet Testing** (Recommended):
- Passkey authentication (fingerprint, Face ID, device biometrics)
- No seed phrases or private keys to manage
- Automatic wallet creation and network configuration
- Uses Base Sepolia network

**MetaMask Testing**:
- MetaMask wallet with Base Sepolia testnet configured
- Base Sepolia ETH for gas fees  
- Base Sepolia USDC tokens for payments (Contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`)

**CDP Testing**:
- Wallets created automatically via API
- Base Sepolia network
- Testnet funding simulated via API endpoints

**Testing Flow**:
- Select wallet type on first launch (Smart Wallet prominently featured)
- Authenticate with passkey (Smart Wallet) or connect existing wallet
- Type messages to trigger payment modal (every query requires 0.1 USDC)
- Complete payment to continue with AI inference

### Important Technical Notes

**USDC Contract Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Base Sepolia)
- All wallets use this USDC contract for payments
- 6 decimal places for USDC token calculations
- Balance queries and transfers target this contract

**Network Configuration**: All wallets operate on Base Sepolia (Chain ID: 84532)
- MetaMask auto-switches to Base Sepolia when connected
- Smart Wallets automatically configure to Base Sepolia
- CDP wallets use Base Sepolia by default

**Smart Wallet SDK**: Uses `@coinbase/wallet-sdk` with smart wallet configuration:
```typescript
const sdk = createCoinbaseWalletSDK({
  appName: 'MCP x402 Payment System',
  smartWallet: { enabled: true }
});
```

### Component Registration

To add new AI-controllable components:
1. Create component with Zod schema in `src/components/ui/`
2. Register in `src/lib/tambo.ts` components array with name, description, and propsSchema
3. AI can then dynamically render the component based on user interactions
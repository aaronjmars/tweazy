# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint for code linting
- `npm run init` - Initialize Tambo configuration

## Project Architecture

**Tweazy** is a Next.js application that demonstrates pay-per-use AI with Web3 payments using x402 protocol, MCP (Model Context Protocol), and CDP Smart Wallets. Users pay 0.01 USDC per AI query.

### Core Systems

**Payment System** (`src/lib/payment.ts`):
- Universal payment handling for both Smart Wallets (CDP) and external wallets
- x402 HTTP 402 Payment Required protocol implementation
- Paymaster integration for gas sponsorship on Smart Wallets
- USDC transfers on Base network (testnet/mainnet)

**Wallet Architecture**:
- Smart Wallets (`src/lib/smart-wallet.ts`, `src/lib/cdp-wallet.ts`): CDP-based passkey authentication with gas sponsorship
- External wallets: wagmi integration for MetaMask, Coinbase Wallet, etc.
- Dual-wallet context in `src/components/WalletProvider.tsx`

**Network Configuration** (`src/lib/config.ts`):
- Environment-based testnet/mainnet switching via `NEXT_PUBLIC_NETWORK_MODE`
- Base Sepolia (testnet, default) and Base Mainnet support
- Network-specific USDC contracts and RPC endpoints
- Centralized config with secrets in environment variables only

**AI Integration**:
- Tambo AI framework for generative UI with React component registry
- MCP protocol support for extensible AI functionality
- x402 payment gates trigger payment flows when AI queries require payment
- Dynamic component rendering based on AI responses

### API Routes Structure

- `POST /api/cdp/create-wallet` - Create CDP Smart Wallet
- `POST /api/cdp/balance` - Check USDC balance
- `POST /api/cdp/transfer` - Execute USDC payments with gas sponsorship
- `POST /api/cdp/fund-wallet` - Fund wallet with testnet tokens
- `POST /api/paymaster` - Handle paymaster gas sponsorship

### Key Files

- `src/lib/config.ts` - Centralized configuration with network switching
- `src/lib/payment.ts` - Universal payment handling for all wallet types
- `src/lib/x402.ts` - HTTP 402 Payment Required protocol implementation
- `src/lib/tambo.ts` - Tambo component registry configuration
- `src/components/WalletProvider.tsx` - Multi-wallet context management
- `src/components/PaymentModal.tsx` - Payment confirmation UI

### Environment Variables

Required:
- `NEXT_PUBLIC_TAMBO_API_KEY` - Tambo AI API key
- `NEXT_PUBLIC_PAYMENT_RECIPIENT` - Wallet address to receive payments

Optional:
- `NEXT_PUBLIC_NETWORK_MODE` - 'testnet' (default) or 'mainnet'
- CDP credentials for enhanced Smart Wallet features (see example.env.local)

### Network Switching

The application automatically switches between Base Sepolia (testnet) and Base Mainnet based on `NEXT_PUBLIC_NETWORK_MODE`. All network configuration (RPC URLs, USDC contracts, chain IDs) updates automatically.

### Security Architecture

- Defaults to testnet for safety (no real funds at risk)
- Secrets only in environment variables, non-secrets in config.ts
- Smart Wallets use passkeys (no private keys), external wallets use user-controlled keys
- All payments validated on-chain

### Testing

For Smart Wallets: No setup required - gas sponsorship means no ETH needed
For external wallets: Need Base Sepolia ETH (gas) and USDC (payments) from faucets
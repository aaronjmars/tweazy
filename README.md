# x402 Payment-Gated AI Chat

A Next.js application implementing **x402 HTTP Payment Required** for AI interactions with triple wallet support (MetaMask, Coinbase CDP & Smart Wallets with Passkeys).

## Overview

This app demonstrates payment-gated AI conversations where users pay **0.1 USDC** per message for AI responses. It showcases the x402 HTTP status code implementation with real blockchain micropayments.

### Key Features

- **Payment-Gated AI**: Every message requires 0.1 USDC payment before AI responds
- **Triple Wallet Support**: MetaMask (Base Sepolia), Coinbase CDP (Base Sepolia), or Smart Wallets with Passkeys
- **Passkey Authentication**: Biometric login with Smart Wallets for enhanced security
- **Tambo AI Integration**: Generative UI with MCP (Model Context Protocol)
- **x402 Implementation**: Proper HTTP 402 Payment Required handling
- **Base Sepolia Network**: All wallets use Base Sepolia testnet for consistency
- **Testnet Safe**: Uses testnet tokens with no real monetary value

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize configuration**:
   ```bash
   npx tambo init
   ```
   *Or manually rename `example.env.local` to `.env.local` and add your API keys*

3. **Add required environment variables** to `.env.local`:
   ```env
   NEXT_PUBLIC_TAMBO_API_KEY=your-tambo-api-key
   NEXT_PUBLIC_PAYMENT_RECIPIENT=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-infura-key
   
   # CDP Wallet (optional)
   CDP_API_KEY_NAME=your-cdp-key-name
   CDP_API_KEY_PRIVATE_KEY=your-cdp-private-key
   CDP_PROJECT_ID=your-cdp-project-id
   NEXT_PUBLIC_CDP_NETWORK=base-sepolia
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## User Flow

1. **Select Wallet**: Choose from Smart Wallet (with passkeys), MetaMask, or Coinbase CDP
2. **Connect/Create Wallet**: Authenticate with passkeys or connect existing wallet
3. **Type Message**: Enter any message in chat
4. **Payment Modal**: Confirm 0.1 USDC payment 
5. **AI Response**: Receive AI response after successful payment

## Wallet Setup

### 🔒 Smart Wallet with Passkeys (Recommended)
- **No setup required** - Wallet created automatically
- **Biometric authentication** - Use fingerprint, Face ID, or other device passkeys
- **Most secure option** - No seed phrases or private keys to manage
- **Instant setup** - Ready in seconds with passkey authentication
- **Base Sepolia network** - Automatically configured

### MetaMask (Base Sepolia Testnet)
- Install MetaMask extension
- Add Base Sepolia network (Chain ID: 84532)
- Get Base Sepolia ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- Get Base Sepolia USDC: Contract `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Coinbase CDP (Base Sepolia)
- Wallets created automatically via API
- Testnet funding handled through application
- No manual wallet setup required

## Architecture

### Core Components
- **Payment System** (`src/lib/payment.ts`): Universal payment handling for all wallet types
- **Smart Wallet Service** (`src/lib/smart-wallet.ts`): Passkey authentication and smart wallet integration
- **CDP Wallet Service** (`src/lib/cdp-wallet.ts`): Coinbase CDP integration
- **Wallet Provider** (`src/components/WalletProvider.tsx`): Multi-wallet context and management
- **Payment UI** (`src/components/PaymentModal.tsx`): Payment confirmation modal
- **x402 Handler** (`src/lib/x402.ts`): HTTP 402 response processing

### MCP Integration
- Configure MCP servers at `/mcp-config`
- Context7 MCP server for payment-gated search
- Stored in browser localStorage

### API Routes (CDP)
- `/api/cdp/create-wallet` - Create CDP wallets
- `/api/cdp/balance` - Check USDC balance  
- `/api/cdp/transfer` - Execute payments
- `/api/cdp/fund-wallet` - Testnet funding

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Add AI-Controllable Components

Components are registered in `src/lib/tambo.ts`:

```tsx
const components: TamboComponent[] = [
  {
    name: "Graph",
    description: "Renders charts using Recharts",
    component: Graph,
    propsSchema: graphSchema, // Zod schema
  },
  // Add more components
];
```

### Modify Payment Flow

Edit payment amounts, recipients, or validation logic in:
- `src/lib/payment.ts` - Payment processing
- `src/components/EnhancedMessageInput.tsx` - Payment trigger (line 113-120)

## Testing

### Prerequisites
- Wallet with testnet tokens (ETH for gas, USDC for payments)
- Valid Tambo API key from [tambo.co/dashboard](https://tambo.co/dashboard)

### Test Scenarios
1. **Smart Wallet Flow**: Create passkey → Authenticate → Send message → Pay → See response
2. **MetaMask Flow**: Connect MetaMask → Switch to Base Sepolia → Send message → Pay → See response  
3. **CDP Flow**: Create CDP wallet → Send message → Pay → See response
4. **Insufficient Balance**: Try with insufficient USDC
5. **Payment Cancellation**: Cancel payment modal
6. **Network Errors**: Test with poor connectivity

## Security Notes

⚠️ **Testnet Only**: Uses Base Sepolia testnet with no real monetary value
- All payments are test transactions
- Smart Wallets use passkeys (most secure - no private keys to manage)
- Private keys should never be shared for MetaMask/CDP wallets
- Use only test/development wallets

## Documentation

- **Tambo AI**: [tambo.co/docs](https://tambo.co/docs)
- **x402 Standard**: HTTP 402 Payment Required specification
- **MCP Protocol**: Model Context Protocol documentation

## Support

For questions or issues:
- Check console for debug information
- Verify environment variables are set correctly
- Ensure wallet has sufficient testnet tokens
- Review network settings (Sepolia/Base Sepolia)

---

**Status**: ✅ Ready for testing - Payment-gated AI chat with Smart Wallet passkey support
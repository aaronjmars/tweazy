# Tweazy - The Best Way to Read Tweets Onchain

Query Twitter with AI in one click, powered by x402 payments, MCP (Model Context Protocol), and CDP wallets with Smart Wallet passkey support.

## Overview

Tweazy demonstrates payment-gated AI interactions where users pay **0.1 USDC** per query to access Twitter data analysis through AI. It showcases the x402 HTTP status code implementation with real blockchain micropayments on Base Sepolia testnet.

### Key Features

- **Twitter AI Queries**: Pay-per-query Twitter data analysis with AI
- **x402 Payment Gates**: HTTP 402 Payment Required implementation for API access
- **Triple Wallet Support**: MetaMask, Coinbase CDP, or Smart Wallets with Passkeys
- **Passkey Authentication**: Biometric login with Smart Wallets for enhanced security
- **Tambo AI Integration**: Generative UI with React component registry and MCP server support
- **Base Sepolia Network**: All wallets use Base Sepolia testnet for consistency
- **MCP Integration**: Model Context Protocol support for extensible AI functionality
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
   NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   
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
3. **Configure MCP**: Set up MCP servers at `/mcp-config` route (optional)
4. **Query Twitter**: Enter Twitter-related queries or search terms
5. **Payment Modal**: Confirm 0.1 USDC payment for AI analysis
6. **AI Response**: Receive AI-powered Twitter data analysis after successful payment

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
- **MCP Utils** (`src/lib/mcp-utils.ts`): MCP server utilities

### Tambo AI & MCP Integration
- **Tambo AI**: Client-side React component registry for AI-driven UI generation
- **MCP Servers**: Configure external MCP servers at `/mcp-config` route
- **Component Registration**: AI can dynamically render registered React components
- **Payment Integration**: x402 payment gates for MCP server interactions
- **Transport Support**: Both SSE and HTTP MCP server protocols
- **Configuration Storage**: MCP server settings stored in browser localStorage

### API Routes (CDP)
- `/api/cdp/create-wallet` - Create CDP wallets
- `/api/cdp/balance` - Check USDC balance  
- `/api/cdp/transfer` - Execute payments
- `/api/cdp/fund-wallet` - Testnet funding

### Tambo AI Components
- **Component Registry** (`src/lib/tambo.ts`): Central registration of AI-controllable React components
- **Graph** (`src/components/ui/Graph.tsx`): Recharts-based visualization component (bar, line, pie charts)
- **DataCard** (`src/components/ui/DataCard.tsx`): List display component for selectable information
- **Zod Schemas**: Each component has a Zod schema defining props for AI interaction
- **Dynamic Rendering**: AI can generate and render components based on user queries

## Development Commands

- `npm run dev` - Start development server at localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting
- `npx tambo init` - Initialize Tambo configuration and create .env.local

## Customization

### Add AI-Controllable Components

Tambo AI uses a component registry system in `src/lib/tambo.ts`:

```tsx
const components: TamboComponent[] = [
  {
    name: "Graph",
    description: "Renders charts using Recharts (bar, line, pie charts)",
    component: Graph,
    propsSchema: graphSchema, // Zod schema for AI interaction
  },
  {
    name: "DataCard", 
    description: "List display component for selectable information",
    component: DataCard,
    propsSchema: dataCardSchema, // Defines props structure for AI
  },
  // Add more components for AI to use
];
```

**How it works:**
1. Register components with Zod schemas defining their props
2. AI analyzes user queries and determines which components to render
3. AI generates appropriate props based on the schema
4. Components are dynamically rendered in the UI

### Modify Payment Flow

Edit payment amounts, recipients, or validation logic in:
- `src/lib/payment.ts` - Payment processing
- `src/lib/x402.ts` - x402 response handling
- `src/components/PaymentModal.tsx` - Payment UI

### Configure MCP Servers

Tambo AI supports external MCP servers for extended functionality:

1. Navigate to `/mcp-config` in your browser
2. Add MCP server configurations:
   ```typescript
   {
     url: "https://your-mcp-server.com",
     transport: "http", // or "sse"
     name: "your-server-name"
   }
   ```
3. Configure payment settings for x402-enabled MCP servers
4. Settings are stored in browser localStorage

**MCP Server Integration:**
- Servers can require payments (x402) before processing requests
- Tambo handles payment flows automatically when x402 responses are received
- Supports both HTTP and Server-Sent Events (SSE) transport protocols

## Testing

### Prerequisites
- Wallet with testnet tokens (ETH for gas, USDC for payments)
- Valid Tambo API key from [tambo.co/dashboard](https://tambo.co/dashboard)
- MCP servers configured (optional for extended AI capabilities)

### Test Scenarios
1. **Smart Wallet Flow**: Create passkey → Authenticate → Query Twitter → Pay → See AI analysis
2. **MetaMask Flow**: Connect MetaMask → Switch to Base Sepolia → Query → Pay → See response  
3. **CDP Flow**: Create CDP wallet → Query → Pay → See response
4. **Tambo MCP Integration**: Configure MCP servers → Test payment-gated AI queries
5. **Insufficient Balance**: Try with insufficient USDC
6. **Payment Cancellation**: Cancel payment modal
7. **Network Errors**: Test with poor connectivity

## Technical Details

### Triple Wallet System
- **Smart Wallet**: Uses Coinbase Wallet SDK with passkey authentication (most secure)
- **MetaMask**: Uses Base Sepolia testnet with wagmi/viem integration  
- **CDP**: Uses Base Sepolia testnet with server-side API integration

### x402 Payment Flow
1. User triggers API call requiring payment (queries to MCP servers)
2. If x402 response received, payment modal displays
3. User confirms 0.1 USDC payment (all wallets use Base Sepolia network)
4. Payment executed through selected wallet
5. After successful payment, original request retries automatically
6. Payment validation uses transaction hashes

### USDC Contract Details
- **Contract Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Base Sepolia)
- **Decimals**: 6 decimal places for USDC token calculations
- **Network**: Base Sepolia (Chain ID: 84532)

## Security Notes

⚠️ **Testnet Only**: Uses Base Sepolia testnet with no real monetary value
- All payments are test transactions
- Smart Wallets use passkeys (most secure - no private keys to manage)
- Private keys should never be shared for MetaMask/CDP wallets
- Use only test/development wallets
- x402 payment validation ensures secure micropayments

## Documentation

- **Tambo AI**: [tambo.co](https://tambo.co) - Generative UI framework with MCP support
- **Tambo GitHub**: [github.com/tambo-ai/tambo](https://github.com/tambo-ai/tambo) - Component registry and MCP integration
- **x402 Standard**: HTTP 402 Payment Required specification
- **MCP Protocol**: Model Context Protocol documentation
- **Coinbase CDP**: [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com)
- **Smart Wallets**: [www.smartwallet.dev](https://www.smartwallet.dev)

## Support

For questions or issues:
- Check console for debug information
- Verify environment variables are set correctly
- Ensure wallet has sufficient testnet tokens
- Review network settings (Base Sepolia)
- Configure MCP servers at `/mcp-config` if needed

---

**Status**: ✅ Ready for testing - Payment-gated AI queries with Smart Wallet passkey support

**Live Demo**: AI-powered data analysis through secure micropayments with MCP integration
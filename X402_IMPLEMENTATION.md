# x402 Implementation for LLM Requests

This document describes the implementation of x402 (HTTP 402 Payment Required) for LLM requests using Sepolia testnet and USDC payments.

## Overview

The implementation adds payment-gated functionality to the Tambo AI application. When users send messages that trigger API calls requiring payment, they may encounter x402 responses requiring 0.1 USDC payment on Sepolia testnet before the request can proceed.

## Architecture

### Core Components

1. **Payment Infrastructure** (`src/lib/payment.ts`)
   - USDC balance checking on Sepolia
   - USDC transfer functionality
   - Balance validation

2. **x402 Handler** (`src/lib/x402.ts`)
   - x402 response detection and parsing
   - Payment flow orchestration
   - Request retry after successful payment

3. **Payment UI** (`src/components/PaymentModal.tsx`)
   - Payment confirmation modal
   - Transaction status display
   - Error handling

4. **Enhanced Message Input** (`src/components/EnhancedMessageInput.tsx`)
   - Integrated payment flow in chat interface
   - x402 response handling
   - Payment modal integration

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Tambo API Key
NEXT_PUBLIC_TAMBO_API_KEY=your-tambo-api-key

# Context7 MCP Configuration
NEXT_PUBLIC_CONTEXT7_MCP_URL=https://api.context7.com/mcp
NEXT_PUBLIC_PAYMENT_RECIPIENT=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# Sepolia Testnet Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-infura-key
```

### Wallet Configuration

The application is configured to use:
- **Network**: Sepolia Testnet
- **Token**: USDC (0.1 USDC per search)
- **Wallet**: MetaMask (required)

## Usage Flow

1. **Connect Wallet**: Users must connect MetaMask wallet
2. **Trigger Search**: Type messages containing "search", "find", or "look up"
3. **Payment Required**: If x402 response received, payment modal appears
4. **Confirm Payment**: User reviews and confirms 0.1 USDC payment
5. **Execute Transaction**: MetaMask prompts for transaction confirmation
6. **Search Execution**: After successful payment, Context7 search proceeds
7. **Display Results**: Formatted search results appear in chat

## Technical Details

### x402 Flow

```typescript
// 1. Attempt search request
const response = await searchWithContext7(query, userAddress);

// 2. If 402 received, parse payment details
const x402Response = parseX402Response(error);

// 3. Show payment modal
const paymentApproved = await showPaymentModal(x402Response.paymentRequired);

// 4. Process payment
const paymentResult = await transferUSDC(recipient, amount);

// 5. Retry original request
const searchResults = await retryAfterPayment(originalRequest, paymentResult);
```

### Payment Validation

- Balance checking before payment attempt
- Transaction confirmation waiting
- Error handling for insufficient funds
- Network-specific validation (Sepolia)

### Security Considerations

- All payments are on Sepolia testnet (no real value)
- Payment recipient address is configurable
- Transaction hashes are validated
- User must explicitly approve each payment

## Testing

### Prerequisites

1. MetaMask wallet with Sepolia testnet configured
2. Sepolia ETH for gas fees
3. Sepolia USDC tokens (testnet)
4. Valid Tambo API key

### Test Scenarios

1. **Successful Payment Flow**
   - Connect wallet
   - Type search query
   - Confirm payment
   - Verify search results

2. **Insufficient Balance**
   - Ensure USDC balance < 0.1
   - Attempt search
   - Verify error message

3. **Payment Cancellation**
   - Trigger payment modal
   - Cancel payment
   - Verify graceful handling

4. **Network Errors**
   - Disconnect internet
   - Attempt search
   - Verify error handling

## Troubleshooting

### Common Issues

1. **"Wallet not connected"**
   - Ensure MetaMask is installed and connected
   - Switch to Sepolia testnet

2. **"Insufficient USDC balance"**
   - Obtain Sepolia USDC from testnet faucets
   - Verify balance in wallet

3. **"Payment failed"**
   - Check gas fees (need Sepolia ETH)
   - Verify network connection
   - Try again with higher gas limit

4. **"Context7 MCP not available"**
   - Check environment variables
   - Verify MCP server URL
   - Ensure payment recipient address is set

### Debug Information

Enable debug logging by adding to console:
```javascript
localStorage.setItem('debug', 'tambo:*,x402:*,payment:*');
```

## Future Enhancements

1. **Multiple Payment Options**
   - Support for different tokens
   - Variable payment amounts
   - Subscription models

2. **Enhanced UX**
   - Payment history
   - Balance display in UI
   - Auto-retry failed payments

3. **Advanced Features**
   - Bulk search payments
   - Payment scheduling
   - Multi-network support

## Support

For issues related to:
- **Tambo AI**: Visit [tambo.co/docs](https://tambo.co/docs)
- **Context7 MCP**: Check Context7 documentation
- **Wallet Issues**: Refer to MetaMask support
- **Sepolia Testnet**: Use official Ethereum testnet resources

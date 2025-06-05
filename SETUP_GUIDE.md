# Setup Guide: x402 Payment Implementation with Sepolia USDC

This guide will help you set up and test the x402 implementation using Sepolia testnet and USDC payments.

## Prerequisites

### 1. MetaMask Wallet Setup

1. **Install MetaMask**: Download from [metamask.io](https://metamask.io)
2. **Add Sepolia Network**:
   - Network Name: `Sepolia`
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.etherscan.io`

### 2. Get Test Tokens

#### Sepolia ETH (for gas fees)
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address
- Request test ETH

#### Sepolia USDC (for payments)
- Visit [Circle Faucet](https://faucet.circle.com/) or [Aave Faucet](https://staging.aave.com/faucet/)
- Connect your wallet
- Request USDC tokens
- Ensure you have at least 1 USDC for testing

### 3. Environment Configuration

1. **Copy environment file**:
   ```bash
   cp example.env.local .env.local
   ```

2. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_TAMBO_API_KEY=your-tambo-api-key-here
   NEXT_PUBLIC_PAYMENT_RECIPIENT=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-infura-key
   ```

3. **Get Tambo API Key**:
   - Visit [tambo.co/dashboard](https://tambo.co/dashboard)
   - Sign up/login
   - Generate API key
   - Add to `.env.local`

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open application**:
   - Navigate to `http://localhost:3000`
   - Connect your MetaMask wallet
   - Switch to Sepolia network

## Testing the Implementation

### 1. Basic Wallet Connection

1. Open the application
2. Click "Connect MetaMask"
3. Approve connection in MetaMask
4. Verify wallet address appears in UI

### 2. Test Search with Payment

1. **Type a search query** in the chat input:
   ```
   search for latest AI developments
   ```

2. **Payment modal should appear** showing:
   - Payment amount: 0.1 USDC
   - Network: Sepolia Testnet
   - Your current USDC balance

3. **Click "Pay with USDC"**:
   - MetaMask will prompt for transaction approval
   - Confirm the transaction
   - Wait for confirmation

4. **Search results** should appear in the chat after successful payment

### 3. Test Error Scenarios

#### Insufficient Balance
1. Ensure USDC balance < 0.1
2. Attempt search
3. Verify error message appears

#### Payment Cancellation
1. Trigger payment modal
2. Click "Cancel" or close modal
3. Verify search is cancelled gracefully

#### Network Issues
1. Disconnect internet
2. Attempt search
3. Verify appropriate error handling

## Troubleshooting

### Common Issues

#### "Wallet not connected"
- **Solution**: Install MetaMask and connect wallet
- **Check**: Wallet is unlocked and connected to correct network

#### "Insufficient USDC balance"
- **Solution**: Get more USDC from testnet faucets
- **Check**: Balance in MetaMask on Sepolia network

#### "Transaction failed"
- **Solution**: Ensure sufficient ETH for gas fees
- **Check**: Network congestion, try higher gas limit

#### "x402 payment not available"
- **Solution**: Check environment variables
- **Check**: `NEXT_PUBLIC_PAYMENT_RECIPIENT` is set

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'tambo:*,x402:*,payment:*');
```

### Test Functions

Run test functions in browser console:
```javascript
// Run all tests
x402Tests.runAllTests();

// Run individual tests
x402Tests.testX402Parsing();
x402Tests.testUSDCFormatting();
```

## Verification Checklist

- [ ] MetaMask installed and connected
- [ ] Sepolia network configured
- [ ] Test ETH available for gas
- [ ] Test USDC available (>= 0.1)
- [ ] Environment variables configured
- [ ] Application running on localhost:3000
- [ ] Wallet connection successful
- [ ] Search triggers payment modal
- [ ] Payment transaction completes
- [ ] Search results display after payment

## Next Steps

Once basic functionality is working:

1. **Test different search queries**
2. **Monitor transaction history** in MetaMask
3. **Check balance changes** after payments
4. **Experiment with error scenarios**
5. **Review implementation code** for customization

## Support Resources

- **Tambo Documentation**: [tambo.co/docs](https://tambo.co/docs)
- **MetaMask Support**: [metamask.io/support](https://metamask.io/support)
- **Sepolia Testnet**: [sepolia.dev](https://sepolia.dev)
- **Ethereum Faucets**: [faucetlink.to](https://faucetlink.to)

## Security Notes

⚠️ **Important**: This implementation uses Sepolia testnet with test tokens that have no real value. Never use real mainnet tokens for testing.

- All payments are on Sepolia testnet only
- Test tokens have no monetary value
- Private keys should never be shared
- Use only test/development wallets

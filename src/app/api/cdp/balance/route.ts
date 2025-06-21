import { NextRequest, NextResponse } from 'next/server';
import { config, envChecker } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json();

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    // Check if CDP credentials are configured
    if (!envChecker.isCDPConfigured()) {
      return NextResponse.json({ balance: config.testing.mockWalletBalance });
    }

    try {
      // Import CDP SDK
      const { CdpClient } = await import('@coinbase/cdp-sdk');

      // Initialize CDP client
      const cdp = new CdpClient({
        apiKeyId: process.env.CDP_API_KEY_NAME!,
        apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
        walletSecret: process.env.CDP_WALLET_SECRET!,
      });

      // Get token balances for the wallet on configured network
      const balances = await cdp.evm.listTokenBalances({
        address: walletId,
        network: config.network.cdpNetwork as 'base-sepolia',
      });

      // Find USDC balance (configurable USDC contract address)
      const usdcAddress = config.contracts.usdc;
      const tokenBalances = Array.isArray(balances) ? balances : (balances as { data?: unknown[] }).data || [];
      const usdcBalance = tokenBalances.find(
        (token: { contractAddress?: string; amount?: string }) => token.contractAddress?.toLowerCase() === usdcAddress.toLowerCase()
      );

      const balance = usdcBalance ? usdcBalance.amount : '0';

      return NextResponse.json({ balance });
    } catch {
      // Fallback to mock balance
      return NextResponse.json({ balance: config.testing.mockWalletBalance });
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
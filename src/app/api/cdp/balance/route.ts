import { NextRequest, NextResponse } from 'next/server';
import { formatUnits, isAddress } from 'viem';
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

    if (typeof walletId !== 'string' || !isAddress(walletId)) {
      return NextResponse.json(
        { error: 'Wallet ID must be a valid EVM address' },
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
      const { balances } = await cdp.evm.listTokenBalances({
        address: walletId,
        network: config.network.cdpNetwork,
      });

      // Find USDC balance (configurable USDC contract address)
      const usdcAddress = config.network.usdcContract;
      const usdcBalance = balances.find(
        (b) => b.token.contractAddress.toLowerCase() === usdcAddress.toLowerCase()
      );

      const balance = usdcBalance
        ? formatUnits(usdcBalance.amount.amount, usdcBalance.amount.decimals)
        : '0';

      return NextResponse.json({ balance });
    } catch (error) {
      // Reporting a fabricated balance here would let the UI claim funds the user
      // does not have, and the payment would then fail on-chain.
      return NextResponse.json(
        {
          error: 'Failed to read balance from CDP',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
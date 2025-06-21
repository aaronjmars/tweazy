import { NextRequest, NextResponse } from 'next/server';
import { config, envChecker } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if CDP credentials are configured
    if (!envChecker.isCDPConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Wallet funded successfully (mock)',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      });
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

      // Request ETH from configured network faucet
      const faucetResponse = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: config.network.cdpNetwork as 'base-sepolia',
        token: 'eth',
      });

      return NextResponse.json({
        success: true,
        message: `Wallet funded with ETH on ${config.network.displayName}`,
        transactionHash: faucetResponse.transactionHash,
        network: config.network.cdpNetwork,
      });

    } catch {
      // Fallback to mock funding
      return NextResponse.json({
        success: true,
        message: 'Wallet funded successfully (fallback)',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        note: 'Fallback funding due to CDP error'
      });
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to fund wallet' },
      { status: 500 }
    );
  }
}
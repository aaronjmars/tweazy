import { NextResponse } from 'next/server';
import { config, envChecker } from '@/lib/config';
import { mockEvmAddress } from '@/lib/utils';

export async function POST() {
  try {
    // Check if CDP credentials are configured
    if (!envChecker.isCDPConfigured()) {
      // Use the same shape as the real CDP path below: id === address.
      // Downstream /api/cdp/balance and /api/cdp/transfer validate walletId
      // with viem's isAddress, so the id must be a valid EVM address.
      const address = mockEvmAddress();
      const walletInfo = {
        id: address,
        address,
        network: config.network.cdpNetwork,
      };
      return NextResponse.json(walletInfo);
    }

    // Import CDP SDK
    const { CdpClient } = await import('@coinbase/cdp-sdk');

    // Initialize CDP client for Base Sepolia
    const cdp = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_NAME!,
      apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
      walletSecret: process.env.CDP_WALLET_SECRET!,
    });

    // Create a new EVM account on Base Sepolia
    const account = await cdp.evm.createAccount();

    const walletInfo = {
      id: account.address, // Use address as ID for simplicity
      address: account.address,
      network: config.network.cdpNetwork,
    };

    return NextResponse.json(walletInfo);
  } catch {
    // Fallback to mock wallet if CDP fails
    const address = mockEvmAddress();
    const walletInfo = {
      id: address,
      address,
      network: config.network.cdpNetwork,
    };

    return NextResponse.json(walletInfo);
  }
}

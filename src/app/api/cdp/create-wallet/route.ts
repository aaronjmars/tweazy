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

    const { CdpClient } = await import('@coinbase/cdp-sdk');

    const cdp = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_NAME!,
      apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
      walletSecret: process.env.CDP_WALLET_SECRET!,
    });

    const account = await cdp.evm.createAccount();

    const walletInfo = {
      id: account.address, // Use address as ID for simplicity
      address: account.address,
      network: config.network.cdpNetwork,
    };

    return NextResponse.json(walletInfo);
  } catch (error) {
    // Never fabricate a wallet address here: the client persists it and the user
    // would fund an account nobody holds the key to.
    return NextResponse.json(
      {
        error: 'Failed to create CDP wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}

import { NextResponse } from 'next/server';
import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';

export async function POST() {
  try {
    Coinbase.configure({
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      privateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
    });

    const wallet = await Wallet.create({
      networkId: process.env.NEXT_PUBLIC_CDP_NETWORK || 'base-sepolia',
    });

    const address = await wallet.getDefaultAddress();

    const walletInfo = {
      id: wallet.getId(),
      address: address.getId(),
      network: process.env.NEXT_PUBLIC_CDP_NETWORK || 'base-sepolia',
    };

    return NextResponse.json(walletInfo);
  } catch (error) {
    console.error('Error creating CDP wallet:', error);
    return NextResponse.json(
      { error: 'Failed to create CDP wallet' },
      { status: 500 }
    );
  }
}
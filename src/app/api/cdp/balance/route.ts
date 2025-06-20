import { NextRequest, NextResponse } from 'next/server';
import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';

export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json();

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    Coinbase.configure({
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      privateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
    });

    const wallet = await Wallet.fetch(walletId);
    const address = await wallet.getDefaultAddress();
    const balance = await address.getBalance('usdc');

    return NextResponse.json({
      balance: balance.toString(),
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
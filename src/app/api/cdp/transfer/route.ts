import { NextRequest, NextResponse } from 'next/server';
import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';

export async function POST(request: NextRequest) {
  try {
    const { walletId, recipient, amount } = await request.json();

    if (!walletId || !recipient || !amount) {
      return NextResponse.json(
        { error: 'Wallet ID, recipient, and amount are required' },
        { status: 400 }
      );
    }

    Coinbase.configure({
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      privateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
    });

    const wallet = await Wallet.fetch(walletId);
    const address = await wallet.getDefaultAddress();

    // Create and broadcast the transfer
    const transfer = await address.createTransfer({
      amount: parseFloat(amount),
      assetId: 'usdc',
      destination: recipient,
    });

    // Wait for the transfer to be broadcast
    await transfer.wait();

    return NextResponse.json({
      success: true,
      transactionHash: transfer.getTransactionHash(),
    });
  } catch (error) {
    console.error('Error transferring USDC:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed',
    });
  }
}
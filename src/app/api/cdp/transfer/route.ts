import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { envChecker } from '@/lib/config';
import { mockTxHash } from '@/lib/utils';

const ALLOW_MOCK = process.env.TWEAZY_ALLOW_MOCK_PAYMENT === '1';

export async function POST(request: NextRequest) {
  try {
    const { walletId, recipient, amount } = await request.json();

    if (!walletId || !recipient || !amount) {
      return NextResponse.json(
        { success: false, error: 'Wallet ID, recipient, and amount are required' },
        { status: 400 }
      );
    }

    if (typeof walletId !== 'string' || !isAddress(walletId)) {
      return NextResponse.json(
        { success: false, error: 'Wallet ID must be a valid EVM address' },
        { status: 400 }
      );
    }

    if (typeof recipient !== 'string' || !isAddress(recipient)) {
      return NextResponse.json(
        { success: false, error: 'Recipient must be a valid EVM address' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'string' && typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Amount must be a string or number' },
        { status: 400 }
      );
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0 || amountNum > 1e18) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive, finite number within allowed range' },
        { status: 400 }
      );
    }

    if (!envChecker.isCDPConfigured()) {
      if (!ALLOW_MOCK) {
        return NextResponse.json(
          { success: false, error: 'Payment processor not configured' },
          { status: 503 }
        );
      }
      return NextResponse.json({
        success: true,
        transactionHash: mockTxHash(),
        mock: true,
      });
    }

    return NextResponse.json(
      { success: false, error: 'CDP transfer is not yet implemented on this deployment' },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { config, envChecker } from "@/lib/config";
import { mockTxHash } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Wallet address must be a valid EVM address" },
        { status: 400 },
      );
    }

    // Check if CDP credentials are configured
    if (!envChecker.isCDPConfigured()) {
      return NextResponse.json({
        success: true,
        message: "Wallet funded successfully (mock)",
        transactionHash: mockTxHash(),
      });
    }

    // Faucets only exist on testnets; there is nothing to call on Base mainnet.
    if (config.network.cdpNetwork !== "base-sepolia") {
      return NextResponse.json(
        { error: `No faucet is available on ${config.network.displayName}` },
        { status: 501 },
      );
    }

    try {
      const { CdpClient } = await import("@coinbase/cdp-sdk");

      const cdp = new CdpClient({
        apiKeyId: process.env.CDP_API_KEY_NAME!,
        apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
        walletSecret: process.env.CDP_WALLET_SECRET!,
      });

      // Request ETH from configured network faucet
      const faucetResponse = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: config.network.cdpNetwork,
        token: "eth",
      });

      return NextResponse.json({
        success: true,
        message: `Wallet funded with ETH on ${config.network.displayName}`,
        transactionHash: faucetResponse.transactionHash,
        network: config.network.cdpNetwork,
      });
    } catch (error) {
      // A fabricated tx hash here reads as a successful faucet call that never happened.
      return NextResponse.json(
        {
          success: false,
          error: "Faucet request failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Failed to fund wallet" }, { status: 500 });
  }
}

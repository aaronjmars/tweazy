import { parseUnits, formatUnits, isAddress, getAddress } from "viem";
import { writeContract, readContract, waitForTransactionReceipt, switchChain } from "wagmi/actions";
import { wagmiConfig } from "./wagmiConfig";
import { config } from "./config";
import { cdpWalletService, CDPWalletInfo } from "./cdp-wallet";
import { smartWalletService, SmartWalletInfo } from "./smart-wallet";

// ERC-20 ABI for USDC transfers
const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface PaymentDetails {
  amount: string; // Amount in USDC (e.g., "0.01")
  recipient: string; // Ethereum address to receive payment
  description?: string;
  transactionId?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export type WalletType = "metamask" | "cdp";

export interface PaymentContext {
  walletType: WalletType;
  walletInfo?: CDPWalletInfo;
  smartWalletInfo?: SmartWalletInfo;
  userAddress?: string;
}

/**
 * Check USDC balance for a given address on Base Sepolia
 */
export async function checkUSDCBalance(address: string): Promise<string> {
  try {
    // Validate and normalize the address
    if (!isAddress(address)) {
      throw new Error("Invalid address format");
    }
    const normalizedAddress = getAddress(address);

    // Ensure we're on the correct chain for balance checking
    try {
      await switchChain(wagmiConfig, { chainId: config.network.chainId });
    } catch {
      // Chain switch not needed or failed for balance check
    }

    const balance = await readContract(wagmiConfig, {
      address: config.network.usdcContract,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [normalizedAddress],
      chainId: config.network.chainId,
    });

    // USDC decimals configurable
    const decimals = config.payment.usdcDecimals;
    return formatUnits(balance, decimals);
  } catch (error) {
    throw new Error("Failed to check USDC balance", { cause: error });
  }
}

/**
 * Transfer USDC tokens on Base Sepolia testnet using MetaMask
 */
export async function transferUSDC(recipient: string, amount: string): Promise<PaymentResult> {
  try {
    // Validate and normalize the recipient address
    if (!isAddress(recipient)) {
      throw new Error("Invalid recipient address format");
    }
    const normalizedRecipient = getAddress(recipient);

    // Ensure we're on the correct chain
    try {
      await switchChain(wagmiConfig, { chainId: config.network.chainId });
    } catch {
      // Chain switch not needed or failed
      // Continue anyway - the writeContract call will handle chain switching
    }

    // Convert amount to proper units (USDC decimals configurable)
    const decimals = config.payment.usdcDecimals;
    const amountInUnits = parseUnits(amount, decimals);

    // Execute the transfer
    const hash = await writeContract(wagmiConfig, {
      address: config.network.usdcContract,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [normalizedRecipient, amountInUnits],
      chainId: config.network.chainId,
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId: config.network.chainId,
    });

    if (receipt.status === "success") {
      return {
        success: true,
        transactionHash: hash,
      };
    } else {
      return {
        success: false,
        error: "Transaction failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Transfer USDC using CDP wallet
 */
export async function transferUSDCWithCDP(
  walletId: string,
  recipient: string,
  amount: string,
): Promise<PaymentResult> {
  try {
    const result = await cdpWalletService.transferUSDC(walletId, recipient, amount);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "CDP transfer failed",
    };
  }
}

/**
 * Universal payment function that handles both MetaMask and CDP wallets
 */
export async function makePayment(
  paymentDetails: PaymentDetails,
  paymentContext: PaymentContext,
): Promise<PaymentResult> {
  switch (paymentContext.walletType) {
    case "metamask":
      return await transferUSDC(paymentDetails.recipient, paymentDetails.amount);

    case "cdp":
      // Handle both regular CDP wallets and smart wallets
      if (paymentContext.smartWalletInfo) {
        return await smartWalletService.transferUSDC(
          paymentContext.smartWalletInfo,
          paymentDetails.recipient,
          paymentDetails.amount,
        );
      } else if (paymentContext.walletInfo?.id) {
        // Use regular CDP wallet
        return await transferUSDCWithCDP(
          paymentContext.walletInfo.id,
          paymentDetails.recipient,
          paymentDetails.amount,
        );
      } else {
        return {
          success: false,
          error: "CDP wallet not found",
        };
      }

    default:
      return {
        success: false,
        error: "Unsupported wallet type",
      };
  }
}

/**
 * Check balance for both wallet types
 */
export async function checkBalance(paymentContext: PaymentContext): Promise<string> {
  switch (paymentContext.walletType) {
    case "metamask":
      if (!paymentContext.userAddress) {
        throw new Error("User address not found for MetaMask");
      }
      return await checkUSDCBalance(paymentContext.userAddress);

    case "cdp":
      // Handle both regular CDP wallets and smart wallets
      if (paymentContext.smartWalletInfo) {
        return await smartWalletService.getBalance(paymentContext.smartWalletInfo);
      } else if (paymentContext.walletInfo?.id) {
        return await cdpWalletService.getBalance(paymentContext.walletInfo.id);
      } else {
        throw new Error("CDP wallet not found");
      }

    default:
      throw new Error("Unsupported wallet type");
  }
}

/**
 * Format USDC amount for display
 */
export function formatUSDCAmount(amount: string): string {
  const num = parseFloat(amount);
  return `${num.toFixed(2)} USDC`;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Generate a non-cryptographic mock 32-byte transaction hash for dev/fallback
 * paths where CDP is not configured. Returns `0x` + 64 hex chars to match the
 * format real EVM tx hashes have, so consumers using viem's Hash type or any
 * length-aware UI don't reject the mock.
 */
export function mockTxHash(): `0x${string}` {
    const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    return ("0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`;
}
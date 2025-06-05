"use client";

import { ReactNode } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function WalletGate({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const connector = injected({ target: "metaMask" });
  const { connect, isPending } = useConnect();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Connect your MetaMask wallet to access Tambo</h1>
      <button
        onClick={() => connect({ connector })}
        disabled={isPending}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {isPending ? "Connecting..." : "Connect MetaMask"}
      </button>
    </div>
  );
}
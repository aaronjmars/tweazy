"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, AlertCircle, Wallet, Info } from 'lucide-react';
import { BASE_SEPOLIA_CHAIN_ID, getPaymasterUrl } from '@/lib/wagmiConfig';
import { useWallet } from '@/components/WalletProvider';
import { useAccount } from 'wagmi';

export function PaymasterExample() {
  const { walletType, isOnCorrectChain, switchToCorrectChain } = useWallet();
  const { address } = useAccount();
  const [testResult, setTestResult] = useState<string>('');

  const testPaymasterAPI = async () => {
    try {
      setTestResult('Testing paymaster API...');

      const partialUserOp = {
        sender: address || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        nonce: '0x0',
        callData: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b6000000000000000000000000000000000000000000000000000000000000f4240',
      };

      const response = await fetch('/api/paymaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partialUserOp }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Paymaster API working! Gas limits received: ${JSON.stringify(data.gasLimits || 'No gas limits')}`);
      } else {
        const error = await response.text();
        setTestResult(`❌ Paymaster API failed: ${error}`);
      }
    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Paymaster Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              How Paymaster Works in x402
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              When you make an x402 payment with a CDP Smart Wallet, the paymaster sponsors your gas fees (ETH)
              while you still pay the required USDC amount. This means you only need USDC in your wallet!
            </p>
            <p className="text-sm text-blue-600">
              💡 Try making a payment in the Chat tab - if you're using a CDP wallet, gas will be sponsored automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Configuration</h4>
              <div className="text-sm space-y-1">
                <div>Chain: <Badge variant="outline">Base Sepolia</Badge></div>
                <div>Paymaster URL: <code className="text-xs bg-gray-100 px-1 rounded">{getPaymasterUrl()}</code></div>
                <div>Chain ID: <code className="text-xs bg-gray-100 px-1 rounded">{BASE_SEPOLIA_CHAIN_ID}</code></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Wallet Status</h4>
              <div className="text-sm space-y-1">
                <div>Connected: {address ? '✅ Yes' : '❌ No'}</div>
                <div>Type: {walletType || 'None'}</div>
                <div>Paymaster Eligible: {
                  (walletType === 'cdp' || walletType === 'smart') ? '✅ Yes' : '❌ MetaMask not supported'
                }</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={testPaymasterAPI} className="w-full">
              Test Paymaster API
            </Button>
            {testResult && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono">{testResult}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Test Paymaster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">Connect a CDP Wallet</h4>
                <p className="text-sm text-gray-600">Use the wallet selector to connect a Coinbase CDP wallet or Smart Wallet</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">Go to Chat Tab</h4>
                <p className="text-sm text-gray-600">Switch to the Chat tab and send a message to trigger an x402 payment</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">Look for Gas Sponsorship</h4>
                <p className="text-sm text-gray-600">In the payment modal, you'll see a "Gas Free" badge if paymaster is active</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Current Implementation Status</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✅ Paymaster API integration</li>
              <li>✅ Gas sponsorship detection in UI</li>
              <li>✅ Fallback to regular transactions</li>
              <li>⚠️ Full UserOperation bundler integration pending</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

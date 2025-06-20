'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CreditCard } from 'lucide-react';

export interface WalletOption {
  type: 'metamask' | 'cdp';
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface WalletSelectorProps {
  onWalletSelect: (walletType: 'metamask' | 'cdp') => void;
}

const walletOptions: WalletOption[] = [
  {
    type: 'metamask',
    name: 'MetaMask',
    description: 'Connect your existing MetaMask wallet',
    icon: <Wallet className="h-8 w-8" />,
  },
  {
    type: 'cdp',
    name: 'Coinbase CDP',
    description: 'Create a new wallet with Coinbase Developer Platform',
    icon: <CreditCard className="h-8 w-8" />,
  },
];

export function WalletSelector({ onWalletSelect }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'cdp' | null>(null);

  const handleWalletSelection = (walletType: 'metamask' | 'cdp') => {
    setSelectedWallet(walletType);
    onWalletSelect(walletType);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Wallet</h1>
          <p className="text-muted-foreground">
            Select how you&apos;d like to connect and make payments for AI services
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {walletOptions.map((option) => (
            <Card
              key={option.type}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedWallet === option.type
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleWalletSelection(option.type)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {option.icon}
                </div>
                <CardTitle>{option.name}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={selectedWallet === option.type ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWalletSelection(option.type);
                  }}
                >
                  {option.type === 'metamask' ? 'Connect MetaMask' : 'Create CDP Wallet'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Both options use Sepolia testnet for development. No real funds required.
          </p>
        </div>
      </div>
    </div>
  );
}
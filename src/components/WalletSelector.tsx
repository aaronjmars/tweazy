'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, Shield, Coins, Fingerprint } from 'lucide-react';

export interface WalletOption {
  type: 'metamask' | 'cdp';
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  network: string;
  recommended?: boolean;
}

interface WalletSelectorProps {
  onWalletSelect: (walletType: 'metamask' | 'cdp') => void;
  onSmartWalletSelect?: () => void;
}

const walletOptions: WalletOption[] = [
  {
    type: 'metamask',
    name: 'Custodial Wallet',
    description: 'Connect any Web3 wallet (MetaMask, Rabby, Coinbase Wallet, etc.)',
    icon: <Wallet className="h-10 w-10 text-orange-500" />,
    features: ['Multi-wallet support', 'Browser extension', 'Full control'],
    network: 'Base Sepolia',
  },
];

export function WalletSelector({ onWalletSelect, onSmartWalletSelect }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'cdp' | 'smart' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletSelection = async (walletType: 'metamask' | 'cdp') => {
    setSelectedWallet(walletType);
    setIsConnecting(true);
    
    // Add slight delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onWalletSelect(walletType);
  };

  const handleSmartWalletSelection = async () => {
    if (!onSmartWalletSelect) return;
    
    setSelectedWallet('smart');
    setIsConnecting(true);
    
    // Add slight delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onSmartWalletSelect();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20 shadow-md">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Tweazy 💥
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Research on X using your favorite crypto wallet, with x402 & MCP
          </p>
        </div>

        {/* Wallet Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Smart Wallet Option */}
          {onSmartWalletSelect && (
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 ${
                selectedWallet === 'smart'
                  ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]'
                  : 'hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:scale-[1.01]'
              }`}
              onClick={() => {
                if (!isConnecting) {
                  handleSmartWalletSelection();
                }
              }}
            >
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none">
                    <Shield className="h-3 w-3 mr-1" />
                    Most Secure
                  </Badge>
                </div>
                
                <div className="flex justify-center">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border">
                    <Fingerprint className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Smart Wallet
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Next-generation wallet with biometric passkey authentication
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Network: Base Sepolia</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['Passkey Auth', 'No Passwords', 'Biometric Security', 'Instant Setup'].map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none"
                  disabled={isConnecting}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isConnecting) {
                      handleSmartWalletSelection();
                    }
                  }}
                >
                  {isConnecting && selectedWallet === 'smart' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Connecting with Passkey...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      Connect with Passkey
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Custodial Wallet Option */}
          {walletOptions.map((option) => (
            <Card
              key={option.type}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedWallet === option.type
                  ? 'ring-2 ring-primary border-primary shadow-md'
                  : 'hover:border-primary/50 hover:shadow-md'
              } ${option.recommended ? 'border-primary/30 bg-card' : 'bg-card'}`}
              onClick={() => {
                if (!isConnecting) {
                  handleWalletSelection(option.type);
                }
              }}
            >
              <CardHeader className="text-center space-y-4">
                {option.recommended && (
                  <div className="flex justify-center">
                    <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                      <Shield className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    {option.icon}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <CardTitle className="text-xl">{option.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {option.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Coins className="h-4 w-4 text-primary" />
                    <span>Network: {option.network}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {option.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={selectedWallet === option.type ? 'default' : 'outline'}
                  disabled={isConnecting}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isConnecting) {
                      handleWalletSelection(option.type);
                    }
                  }}
                >
                  {isConnecting && selectedWallet === option.type ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      Connecting...
                    </div>
                  ) : (
                    'Connect Wallet'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Base Sepolia testnet only • No real funds required • Secure & Private</span>
          </div>
          <div className="max-w-lg mx-auto p-4 rounded-lg bg-muted/30 border">
            <p className="text-xs text-muted-foreground">
              Both wallet options use Base Sepolia testnet and support USDC payments for AI inferences.
              Smart Wallet offers enhanced security with biometric authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
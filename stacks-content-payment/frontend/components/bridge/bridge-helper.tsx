"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, CheckCircle2, Loader2, AlertCircle, Zap } from "lucide-react";
import { useStacks } from "@/hooks/use-stacks";
import { stacks } from "@/lib/stacks";

const MOCK_USDC_CONTRACT = process.env.NEXT_PUBLIC_MOCK_USDC || "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.mock-usdc";

export function BridgeHelper() {
  const { address } = useStacks();
  const [usdcxBalance, setUsdcxBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for balance updates
  useEffect(() => {
    if (!address) return;

    const checkBalance = async () => {
      try {
        const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`);
        const data = await response.json();
        const fungibleTokens = data.fungible_tokens;
        const mockUsdcToken = fungibleTokens[MOCK_USDC_CONTRACT];
        if (mockUsdcToken) {
          setUsdcxBalance((parseInt(mockUsdcToken.balance) / 1000000).toFixed(2));
        }
      } catch (error) {
        console.error("Error fetching mock USDC balance:", error);
      }
    };

    checkBalance();
    const interval = setInterval(checkBalance, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [address, txId]); // Re-check when txId changes

  const handleMintTestTokens = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);

    try {
      // Import required functions
      const { openContractCall } = await import('@stacks/connect');
      const { uintCV, principalCV, AnchorMode } = await import('@stacks/transactions');
      const { STACKS_TESTNET } = await import('@stacks/network');

      const network = STACKS_TESTNET;
      const [contractAddress, contractName] = MOCK_USDC_CONTRACT.split('.');

      // Mint 100 test USDCx (100 * 10^6 because 6 decimals)
      const amount = 100_000_000; // 100 USDCx

      const result = await new Promise<string>((resolve, reject) => {
        openContractCall({
          network,
          contractAddress,
          contractName,
          functionName: 'mint',
          functionArgs: [
            uintCV(amount),
            principalCV(address)
          ],
          anchorMode: AnchorMode.Any,
          onFinish: (data) => {
            resolve(data.txId);
          },
          onCancel: () => {
            reject(new Error('Transaction cancelled'));
          },
        });
      });

      setTxId(result);

      // Wait a bit then refresh balance
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint test tokens');
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <Card className="neo-border neo-shadow bg-yellow-300">
        <CardHeader>
          <CardTitle className="font-black uppercase">Get Test USDCx</CardTitle>
          <CardDescription className="font-bold text-black">
            Connect your wallet to get test tokens
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (txId) {
    return (
      <Card className="neo-border neo-shadow bg-green-400">
        <CardHeader>
          <CardTitle className="font-black uppercase flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Test USDCx Minted!
          </CardTitle>
          <CardDescription className="font-bold text-black">
            100 test USDCx has been sent to your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs font-mono bg-white neo-border p-2 break-all">
            TX: {txId}
          </div>
          <Button
            onClick={() => window.open(`https://explorer.hiro.so/txid/${txId}?chain=testnet`, "_blank")}
            className="w-full neo-border neo-shadow-sm font-black uppercase"
            variant="outline"
          >
            View Transaction
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Test Mode */}
      <Card className="neo-border-thick neo-shadow-lg bg-gradient-to-br from-cyan-400 to-blue-400">
        <CardHeader>
          <CardTitle className="font-black uppercase text-2xl flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Quick Test Mode
          </CardTitle>
          <CardDescription className="font-bold text-black text-base">
            Get 100 test USDCx instantly for testing payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white neo-border p-4">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase">Your Balance:</span>
              <span className="text-2xl font-black">{usdcxBalance} USDCx</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-400 neo-border p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span className="font-bold text-sm">{error}</span>
            </div>
          )}

          <Button
            onClick={handleMintTestTokens}
            disabled={loading}
            className="w-full h-14 bg-orange-500 text-white neo-border neo-shadow font-black text-lg uppercase transition-all neo-hover"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Minting...
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 mr-2" />
                Get 100 Test USDCx
              </>
            )}
          </Button>

          <div className="bg-cyan-100 neo-border p-3">
            <p className="text-xs font-bold text-black">
              💡 <strong>For Testing Only:</strong> This mints test tokens from the mock-usdc contract. Perfect for demos and testing payments!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Real Bridge Info */}
      <Card className="neo-border neo-shadow bg-white">
        <CardHeader>
          <CardTitle className="font-black uppercase">Production Bridge</CardTitle>
          <CardDescription className="font-bold">
            For real USDCx, bridge from Ethereum Sepolia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="font-bold">Steps for real bridging:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Get Sepolia ETH from faucet</li>
              <li>Get USDC on Sepolia from Circle faucet</li>
              <li>Use Stacks bridge to transfer to testnet</li>
              <li>Wait 20-30 minutes for confirmation</li>
            </ol>
          </div>

          <Button
            variant="outline"
            className="w-full neo-border neo-shadow-sm font-black uppercase"
            onClick={() => window.open('https://bridge.stacks.org', '_blank')}
          >
            Open Stacks Bridge →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

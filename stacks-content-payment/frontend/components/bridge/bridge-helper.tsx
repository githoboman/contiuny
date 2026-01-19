"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExternalLink, CheckCircle2, Loader2, Info } from "lucide-react";
import { useStacks } from "@/hooks/use-stacks";

const CONFIG = {
  USDC_SEPOLIA_FAUCET: "https://faucet.circle.com/",
  ETH_SEPOLIA_EXPLORER: "https://sepolia.etherscan.io/tx/",
  STACKS_EXPLORER: "https://explorer.hiro.so/txid/",
  USDCX_CONTRACT: process.env.NEXT_PUBLIC_USDCX_ADDRESS || "SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.token-wusdcx",
};

export function BridgeHelper() {
  const { address } = useStacks();
  const [step, setStep] = useState(1);
  const [ethTxHash, setEthTxHash] = useState("");
  const [usdcxBalance, setUsdcxBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  // Poll for balance updates
  useEffect(() => {
    if (!address) return;

    const checkBalance = async () => {
      try {
        const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`);
        const data = await response.json();
        const fungibleTokens = data.fungible_tokens;
        const usdcxToken = fungibleTokens[CONFIG.USDCX_CONTRACT];
        if (usdcxToken) {
          setUsdcxBalance((parseInt(usdcxToken.balance) / 1000000).toFixed(2));
        }
      } catch (error) {
        console.error("Error fetching USDCx balance:", error);
      }
    };

    checkBalance();
    const interval = setInterval(checkBalance, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [address]);

  return (
    <Card className="w-full max-w-2xl mx-auto border-orange-300 bg-white shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-orange-600">
              Bridge to USDCx
            </CardTitle>
            <CardDescription>
              Bring stablecoin liquidity from Ethereum Sepolia to Stacks Testnet
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground font-medium block">Current Balance</span>
            <span className="text-xl font-mono text-orange-600 font-bold">{usdcxBalance} USDCx</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-muted-foreground/20" />

          <div className="space-y-8 relative">
            {/* Step 1 */}
            <div className={`flex gap-4 items-start ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`mt-1 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${step >= 1 ? 'border-orange-600 text-orange-600 font-bold' : 'border-gray-400 text-gray-400'}`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-lg">Get Testnet USDC (Sepolia)</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  First, you&apos;ll need testnet USDC on Ethereum Sepolia. Visit the Circle faucet to mint some tokens to your Ethereum wallet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(CONFIG.USDC_SEPOLIA_FAUCET, "_blank")}
                  className="mt-2 border-orange-500 hover:bg-orange-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Circle Faucet
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex gap-4 items-start ${step === 2 ? 'opacity-100' : 'opacity-50 transition-opacity'}`}>
              <div className={`mt-1 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${step >= 2 ? 'border-orange-600 text-orange-600 font-bold' : 'border-gray-400 text-gray-400'}`}>
                {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : "2"}
              </div>
              <div className="flex-1 space-y-4">
                <h4 className="font-semibold text-lg">Bridge to Stacks</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use the programmatic bridge script or the USDCx portal to send your USDC to Stacks. Your recipient address is:
                </p>
                <div className="p-3 bg-muted rounded-md font-mono text-xs break-all border border-muted-foreground/10 select-all">
                  {address || "Connect wallet to see address"}
                </div>
                {step === 2 && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => setStep(3)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      I&apos;ve initiated the bridge
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      size="sm"
                    >
                      Back
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex gap-4 items-start ${step === 3 ? 'opacity-100' : 'opacity-50 transition-opacity'}`}>
              <div className={`mt-1 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${step >= 3 ? 'border-green-600 text-green-600 font-bold' : 'border-gray-400 text-gray-400'}`}>
                {parseFloat(usdcxBalance) > 0 ? <CheckCircle2 className="w-5 h-5" /> : step === 3 ? <Loader2 className="w-5 h-5 animate-spin" /> : "3"}
              </div>
              <div className="flex-1 space-y-4">
                <h4 className="font-semibold text-lg">Wait for Minting</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Stacks attestation service will verify your Ethereum deposit and mint USDCx on Stacks. This usually takes 10-15 minutes.
                </p>
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Ethereum TX Hash (Optional)</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="0x..."
                          value={ethTxHash}
                          onChange={(e) => setEthTxHash(e.target.value)}
                          className="font-mono text-xs h-9"
                        />
                        {ethTxHash && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`${CONFIG.ETH_SEPOLIA_EXPLORER}${ethTxHash}`, "_blank")}
                            className="h-9"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {parseFloat(usdcxBalance) > 0 ? (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <div>
                          <p className="text-sm font-semibold text-green-400">Tokens Received!</p>
                          <p className="text-xs text-green-400/70">Your USDCx balance has updated. You&apos;re ready to register content.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3 animate-pulse">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <p className="text-sm text-blue-400">Monitoring Stacks mempool for minting event...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 border-t border-muted/50 p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-tight">
            Note: This is an instructional guide for the USDCx bridge. Actual bridging requires interaction with the Ethereum network using a compatible wallet. The bridge process is powered by Circle&apos;s xReserve protocol.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

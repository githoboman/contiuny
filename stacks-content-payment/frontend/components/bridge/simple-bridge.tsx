'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Wallet, RefreshCw, ArrowRight } from 'lucide-react';
import { useWallet } from '@/components/wallet/wallet-provider';
import { useUsdcxBalance } from '@/lib/hooks/useTokenBalance';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ETHEREUM_CONFIG, USDC_ABI, XRESERVE_ABI } from '@/lib/ethereum/constants';
import { remoteRecipientCoder, bytes32FromBytes } from '@/lib/bridge/usdc-helpers';

export function SimpleBridge({ onSuccess }: { onSuccess?: () => void }) {
    const { open } = useAppKit();
    const { address: ethAddress, isConnected: isEthConnected } = useAppKitAccount();
    const { address: stxAddress } = useWallet();
    const { balance: usdcxBalance, loading: balanceLoading } = useUsdcxBalance(stxAddress);

    // Bridge State
    const [amount, setAmount] = useState<string>('1.0');
    const [status, setStatus] = useState<'idle' | 'approving' | 'depositing' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Wagmi Hooks
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();

    // Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: ETHEREUM_CONFIG.USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: ethAddress ? [ethAddress as `0x${string}`, ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`] : undefined,
        query: {
            enabled: !!ethAddress,
        } // Correct usage for TanStack Query v5 in Wagmi v2
    });

    const isAllowanceSufficient = allowance && parseUnits(amount || '0', 6) <= (allowance as bigint);

    const handleApprove = async () => {
        if (!ethAddress) return;
        setStatus('approving');
        setErrorMsg(null);
        try {
            const val = parseUnits(amount, 6);
            const hash = await writeContractAsync({
                address: ETHEREUM_CONFIG.USDC_ADDRESS as `0x${string}`,
                abi: USDC_ABI,
                functionName: 'approve',
                args: [ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`, val],
            });
            console.log('Approval Tx:', hash);

            // Wait for confirmation
            await publicClient?.waitForTransactionReceipt({ hash });
            await refetchAllowance();
            setStatus('idle');
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setErrorMsg("Approval failed: " + (e.shortMessage || e.message));
        }
    };

    const handleDeposit = async () => {
        if (!ethAddress || !stxAddress) return;
        setStatus('depositing');
        setErrorMsg(null);
        try {
            const val = parseUnits(amount, 6);

            // Encode Stacks Recipient
            // Logic from guide: bytes32FromBytes(remoteRecipientCoder.encode(stxAddress))
            const remoteRecipient = bytes32FromBytes(remoteRecipientCoder.encode(stxAddress));

            const hash = await writeContractAsync({
                address: ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`,
                abi: XRESERVE_ABI,
                functionName: 'depositToRemote',
                args: [
                    val,
                    ETHEREUM_CONFIG.STACKS_DOMAIN, // remoteDomain (uint32) - pass as number
                    remoteRecipient, // remoteRecipient (bytes32)
                    ETHEREUM_CONFIG.USDC_ADDRESS as `0x${string}`, // localToken (address)
                    BigInt(0), // maxFee - use BigInt(0) instead of 0n
                    '0x', // hookData
                ],
            });
            console.log('Deposit Tx:', hash);
            setTxHash(hash);
            setStatus('success');
            onSuccess?.();
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setErrorMsg("Deposit failed: " + (e.shortMessage || e.message));
        }
    };

    return (
        <Card className="neo-border bg-white w-full max-w-md mx-auto">
            <CardHeader className="bg-black text-white neo-border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="uppercase font-black flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-cyan-400" />
                        USDC Bridge
                    </CardTitle>
                    {stxAddress && (
                        <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase font-bold">Stacks Bal</div>
                            <div className="text-lg font-black text-white flex items-center gap-1">
                                {balanceLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>{usdcxBalance.toFixed(2)} xUSDC</>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-800">
                    <strong>Sepolia → Stacks Testnet:</strong> Bridge USDC to receive USDCx on Stacks.
                    Get testnet USDC from <a href="https://faucet.circle.com/" target="_blank" className="underline font-bold">Circle Faucet</a>.
                </div>

                {!stxAddress ? (
                    <div className="text-center py-4">
                        <Button className="w-full neo-btn cursor-not-allowed opacity-50">
                            Connect Stacks Wallet First
                        </Button>
                        <p className="text-xs text-gray-400 mt-2">Use top-right button to connect</p>
                    </div>
                ) : !isEthConnected ? (
                    <div className="text-center py-4">
                        <Button onClick={() => open()} className="w-full neo-btn bg-purple-600 text-white border-purple-900 hover:bg-purple-700">
                            Connect Sepolia Wallet
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500">Amount (USDC)</label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="neo-input text-lg font-bold"
                                min="0.01"
                                step="0.01"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Step 1: Approve */}
                            <Button
                                onClick={handleApprove}
                                disabled={status !== 'idle' || !!isAllowanceSufficient}
                                variant={isAllowanceSufficient ? "secondary" : "default"}
                                className={`w-full h-auto py-3 flex flex-col gap-1 border-2 ${isAllowanceSufficient ? 'border-green-200 bg-green-50 opacity-100' : 'border-black'}`}
                            >
                                {status === 'approving' ? <Loader2 className="animate-spin w-4 h-4" /> : isAllowanceSufficient ? "Approved ✅" : "1. Approve"}
                            </Button>

                            {/* Step 2: Bridge */}
                            <Button
                                onClick={handleDeposit}
                                disabled={status !== 'idle' || !isAllowanceSufficient}
                                className="w-full h-auto py-3 flex flex-col gap-1 neo-btn bg-cyan-400 text-black border-black hover:bg-cyan-300 disabled:opacity-50"
                            >
                                {status === 'depositing' ? <Loader2 className="animate-spin w-4 h-4" /> : "2. Bridge 🌉"}
                            </Button>
                        </div>

                        {txHash && (
                            <div className="bg-green-50 p-3 text-xs text-green-800 border border-green-200 rounded">
                                <strong>Transaction Sent!</strong><br />
                                <a href={`${ETHEREUM_CONFIG.EXPLORER}/tx/${txHash}`} target="_blank" className="underline break-all">View on Etherscan</a>
                            </div>
                        )}
                        {errorMsg && (
                            <div className="bg-red-50 p-3 text-xs text-red-800 border border-red-200 rounded break-words">
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        <div className="text-xs text-center text-gray-400">
                            <span className="font-mono">{ethAddress?.slice(0, 6)}...{ethAddress?.slice(-4)}</span>
                            <ArrowRight className="w-3 h-3 inline mx-1" />
                            <span className="font-mono">{stxAddress?.slice(0, 6)}...{stxAddress?.slice(-4)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

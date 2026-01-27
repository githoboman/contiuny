'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useState } from 'react';
import { useWallet } from '@/components/wallet/wallet-provider';
import { useUsdcxBalance } from '@/lib/hooks/useTokenBalance';
import { useWriteContract, useReadContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { ETHEREUM_CONFIG, USDC_ABI, XRESERVE_ABI } from '@/lib/ethereum/constants';
import { remoteRecipientCoder, bytes32FromBytes } from '@/lib/bridge/usdc-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowDown, ArrowRight, Wallet, Check, Loader2, ArrowLeftRight } from 'lucide-react';

import { NeoCard } from '../ui/neo-card';
import { NeoButton } from '../ui/neo-button';
import { NeoInput } from '../ui/neo-input';
import { NeoBadge } from '../ui/neo-badge';

export function SimpleBridge({ onSuccess }: { onSuccess?: () => void }) {
    const { open } = useAppKit();
    const { address: ethAddress, isConnected: isEthConnected } = useAppKitAccount();
    const { address: stxAddress } = useWallet();
    const { balance: usdcxBalance, loading: balanceLoading } = useUsdcxBalance(stxAddress);

    // Bridge State
    const [amount, setAmount] = useState<string>('10.0');
    const [status, setStatus] = useState<'idle' | 'approving' | 'depositing' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [direction, setDirection] = useState<'eth-to-stx' | 'stx-to-eth'>('eth-to-stx'); // For future reversing

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
        }
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
            const remoteRecipient = bytes32FromBytes(remoteRecipientCoder.encode(stxAddress));

            const hash = await writeContractAsync({
                address: ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`,
                abi: XRESERVE_ABI,
                functionName: 'depositToRemote',
                args: [
                    val,
                    Number(ETHEREUM_CONFIG.STACKS_DOMAIN),
                    remoteRecipient,
                    ETHEREUM_CONFIG.USDC_ADDRESS as `0x${string}`,
                    BigInt(0), // maxFee
                    '0x', // hookData
                ],
            });
            console.log('Deposit Tx:', hash);
            setTxHash(hash);
            setStatus('success');

            // Celebration!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF6B00', '#000000', '#FFFFFF']
            });

            onSuccess?.();
            setAmount('');
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setErrorMsg("Deposit failed: " + (e.shortMessage || e.message));
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Header / Title */}
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                    Bridge <span className="text-[#FF6B00]">Assets</span>
                </h2>
                <p className="font-bold text-gray-500">
                    Move USDC from Sepolia to Stacks Testnet
                </p>
            </div>

            <NeoCard className="p-8 relative overflow-hidden">
                {/* Network Selector Visuals */}
                <div className="relative mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* From Network */}
                        <div className="w-full relative group">
                            <label className="text-xs font-black uppercase mb-2 block text-gray-500">From Network</label>
                            <NeoCard className="p-4 flex items-center justify-between bg-gray-50 group-hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">E</div>
                                    <div>
                                        <div className="font-black uppercase">Ethereum</div>
                                        <div className="text-xs text-gray-500">Sepolia Testnet</div>
                                    </div>
                                </div>
                                <NeoBadge variant="success" animatePulse>{isEthConnected ? "Connected" : "Off"}</NeoBadge>
                            </NeoCard>
                        </div>

                        {/* Swap Arrow */}
                        <motion.div
                            className="z-10 bg-white p-2 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_#000000] cursor-pointer hover:scale-110 transition-transform"
                            whileHover={{ rotate: 180 }}
                            onClick={() => console.log("Swap not implemented yet")}
                        >
                            <ArrowLeftRight className="w-6 h-6" />
                        </motion.div>

                        {/* To Network */}
                        <div className="w-full relative group">
                            <label className="text-xs font-black uppercase mb-2 block text-gray-500">To Network</label>
                            <NeoCard className="p-4 flex items-center justify-between bg-gray-50 group-hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">S</div>
                                    <div>
                                        <div className="font-black uppercase">Stacks</div>
                                        <div className="text-xs text-gray-500">Testnet</div>
                                    </div>
                                </div>
                                <NeoBadge variant={stxAddress ? "success" : "outline"}>{stxAddress ? "Connected" : "Off"}</NeoBadge>
                            </NeoCard>
                        </div>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-black uppercase">Amount to Bridge</label>
                        <span className="text-xs font-bold text-gray-500">Balance: -- USDC</span>
                    </div>
                    <div className="relative">
                        <NeoInput
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            type="number"
                            placeholder="0.00"
                            className="text-4xl h-20 px-6 font-black"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                            <span className="font-black text-xl text-gray-400">USDC</span>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-bold text-gray-500">
                        <span>Fee: ~0.00 USDC</span>
                        <span>Est. Time: ~15 mins</span>
                    </div>
                </div>

                {/* Wallet Connection Gates */}
                {!stxAddress ? (
                    <div className="text-center py-4 bg-gray-50 border-2 border-dashed border-gray-300 mb-4">
                        <p className="font-bold mb-4">Connect Stacks wallet to receive funds</p>
                        {/* The connect button is in header, user might be confused. We can't trigger it easily from here if it's in a different provider context without exposing connect. 
                            But SimpleBridge uses useWallet so we HAVE the connect function available if we destructured it?
                            Actually useWallet gives connect(). Let's fetch it.
                         */}
                        {/* We need to update component to get connect from useWallet */}
                    </div>
                ) : !isEthConnected ? (
                    <NeoButton
                        onClick={() => open()}
                        className="w-full py-6 text-xl"
                        variant="secondary"
                    >
                        Connect Ethereum Wallet
                    </NeoButton>
                ) : (
                    <div className="space-y-4">
                        {/* Actions */}
                        <div className="grid grid-cols-1 gap-4">
                            {!isAllowanceSufficient ? (
                                <NeoButton
                                    onClick={handleApprove}
                                    disabled={status === 'approving'}
                                    className="w-full py-6 text-xl relative overflow-hidden"
                                    variant="secondary"
                                >
                                    {status === 'approving' ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" /> Approving...
                                        </span>
                                    ) : (
                                        "1. Approve USDC"
                                    )}
                                </NeoButton>
                            ) : (
                                <NeoButton
                                    onClick={handleDeposit}
                                    disabled={status === 'depositing'}
                                    className="w-full py-6 text-xl"
                                    variant="primary" // Orange
                                >
                                    {status === 'depositing' ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" /> Bridging...
                                        </span>
                                    ) : (
                                        "BRIDGE ASSETS"
                                    )}
                                </NeoButton>
                            )}
                        </div>

                        {/* Status Messages */}
                        <AnimatePresence>
                            {txHash && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-100 border-4 border-black p-4 mt-4 text-center"
                                >
                                    <div className="font-black text-green-800 text-lg mb-1 flex items-center justify-center gap-2">
                                        <Check className="w-6 h-6 border-2 border-green-800 rounded-full p-0.5" />
                                        Success!
                                    </div>
                                    <p className="font-bold text-sm mb-2">Bridge transaction submitted.</p>
                                    <a
                                        href={`${ETHEREUM_CONFIG.EXPLORER}/tx/${txHash}`}
                                        target="_blank"
                                        className="underline font-bold hover:text-green-600"
                                    >
                                        View on Etherscan
                                    </a>
                                </motion.div>
                            )}

                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-100 border-4 border-black p-4 mt-4"
                                >
                                    <p className="font-black text-red-600 uppercase mb-1">Error</p>
                                    <p className="font-medium text-sm">{errorMsg}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </NeoCard>

            {/* Recent Bridges / Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NeoCard className="bg-black text-white border-orange-500">
                    <h3 className="text-[#FF6B00] font-black uppercase text-sm mb-2">How it works</h3>
                    <ul className="text-sm space-y-2 font-medium opacity-80 list-disc list-inside">
                        <li>Approve USDC usage</li>
                        <li>Deposit to Bridge Contract</li>
                        <li>Wait for Stacks confirmation (~15m)</li>
                        <li>Receive USDCx automatically</li>
                    </ul>
                </NeoCard>

                <NeoCard className="bg-white">
                    <h3 className="text-black font-black uppercase text-sm mb-4">Your Balances</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b-2 border-gray-100">
                            <span className="font-bold text-gray-500">Stacks USDCx</span>
                            <span className="font-black text-xl">
                                {balanceLoading ? "..." : usdcxBalance.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-500">Eth USDC</span>
                            {/* We don't have ETH USDC balance hook yet, simpler to omit or just show -- */}
                            <span className="font-black text-xl">--</span>
                        </div>
                    </div>
                </NeoCard>
            </div>
        </div>
    );
}

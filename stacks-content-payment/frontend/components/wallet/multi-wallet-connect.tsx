'use client';

import { useWallet } from './wallet-provider';
import { formatStx, shortenAddress } from '@/lib/utils';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUsdcxBalance } from '@/lib/hooks/useTokenBalance';


import { NeoButton } from '../ui/neo-button';
import { NeoCard } from '../ui/neo-card';
import { NeoBadge } from '../ui/neo-badge';

export function MultiWalletConnect() {
    const { address: stxAddress, isConnected: stxConnected, balance, connect: connectStacks, disconnect: disconnectStacks } = useWallet();
    const { address: ethAddress, isConnected: ethConnected } = useAccount();
    const { disconnect: disconnectEth } = useDisconnect();
    const { open } = useAppKit();
    const { balance: usdcxBalance } = useUsdcxBalance(stxAddress);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const openEthModal = async () => {
        await open();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    const isStacksOnly = stxConnected && !ethConnected;
    const isEthOnly = !stxConnected && ethConnected;
    const isBothConnected = stxConnected && ethConnected;
    const isNeitherConnected = !stxConnected && !ethConnected;

    // Display Logic
    let buttonText = "Connect Wallet";
    let buttonVariant: "primary" | "secondary" = "primary";

    if (isBothConnected) {
        buttonText = "Wallets (2)";
        buttonVariant = "primary"; // Orange
    } else if (isStacksOnly) {
        buttonText = shortenAddress(stxAddress || '');
        buttonVariant = "primary";
    } else if (isEthOnly) {
        buttonText = shortenAddress(ethAddress || '');
        buttonVariant = "secondary"; // White
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <NeoButton
                variant={buttonVariant}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2"
                neoSize="sm"
            >
                <Wallet className="w-4 h-4" />
                {buttonText}
                <ChevronDown className="w-4 h-4" />
            </NeoButton>

            {showDropdown && (
                <div className="absolute right-0 mt-4 w-80 z-50">
                    <NeoCard className="p-0 overflow-hidden">
                        <div className="p-4 bg-black text-white border-b-4 border-white">
                            <h3 className="font-black uppercase text-sm">Wallet Connections</h3>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Stacks Wallet */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold uppercase text-xs flex items-center gap-2">
                                        Stacks
                                        {stxConnected && <NeoBadge variant="success" className="text-[10px] py-0 px-1">Connected</NeoBadge>}
                                    </span>
                                    {stxConnected ? (
                                        <button onClick={disconnectStacks} className="text-red-600 hover:text-red-700">
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <NeoButton variant="primary" neoSize="sm" onClick={() => { connectStacks(); setShowDropdown(false); }} className="px-2 py-1 text-xs">
                                            Connect
                                        </NeoButton>
                                    )}
                                </div>
                                {stxConnected && (
                                    <div className="bg-gray-50 border-2 border-black p-2 text-xs font-mono space-y-1">
                                        <div className="truncate">{stxAddress}</div>
                                        <div className="flex justify-between font-bold">
                                            <span>{formatStx(balance)}</span>
                                            <span className="text-[#FF6B00]">{usdcxBalance.toFixed(2)} USDCx</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ethereum Wallet */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold uppercase text-xs flex items-center gap-2">
                                        Ethereum
                                        {ethConnected && <NeoBadge variant="success" className="text-[10px] py-0 px-1">Connected</NeoBadge>}
                                    </span>
                                    {ethConnected ? (
                                        <button onClick={() => disconnectEth()} className="text-red-600 hover:text-red-700">
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <NeoButton variant="secondary" neoSize="sm" onClick={() => { openEthModal(); setShowDropdown(false); }} className="px-2 py-1 text-xs">
                                            Connect
                                        </NeoButton>
                                    )}
                                </div>
                                {ethConnected && (
                                    <div className="bg-gray-50 border-2 border-black p-2 text-xs font-mono space-y-1">
                                        <div className="truncate">{ethAddress}</div>
                                        <div className="text-gray-500">Sepolia Testnet</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </NeoCard>
                </div>
            )}
        </div>
    );
}

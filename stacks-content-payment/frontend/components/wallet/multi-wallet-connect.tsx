'use client';

import { useWallet } from './wallet-provider';
import { formatStx, shortenAddress } from '@/lib/utils';
import { useAccount, useDisconnect } from 'wagmi';
import { Wallet, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function MultiWalletConnect() {
    const { address: stxAddress, isConnected: stxConnected, balance, connect: connectStacks, disconnect: disconnectStacks } = useWallet();
    const { address: ethAddress, isConnected: ethConnected } = useAccount();
    const { disconnect: disconnectEth } = useDisconnect();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Function to open Ethereum wallet modal
    const openEthModal = () => {
        if (typeof window !== 'undefined') {
            // Trigger the AppKit modal via the button that exists in the DOM
            const appKitButton = document.querySelector('appkit-button') as HTMLElement;
            if (appKitButton) {
                appKitButton.click();
            } else {
                // Fallback: use web3modal if available
                (window as any).modal?.open?.();
            }
        }
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


    // Both wallets connected
    if (stxConnected && ethConnected) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="px-4 py-2 bg-green-500 text-white neo-border neo-shadow-sm font-black uppercase text-sm transition-all neo-hover flex items-center gap-2"
                >
                    <Wallet className="w-4 h-4" />
                    Connected
                    <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white neo-border neo-shadow-lg p-4 space-y-3 z-50">
                        {/* Stacks Wallet */}
                        <div className="pb-3 border-b-2 border-black">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black uppercase text-xs text-orange-500">Stacks</span>
                                <button
                                    onClick={() => {
                                        disconnectStacks();
                                        setShowDropdown(false);
                                    }}
                                    className="text-xs font-bold text-red-600 hover:underline"
                                >
                                    Disconnect
                                </button>
                            </div>
                            <div className="font-mono text-xs mb-1">{shortenAddress(stxAddress!)}</div>
                            <div className="text-xs text-gray-600">{formatStx(balance)}</div>
                        </div>

                        {/* Ethereum Wallet */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black uppercase text-xs text-blue-500">Ethereum</span>
                                <button
                                    onClick={() => {
                                        disconnectEth();
                                        setShowDropdown(false);
                                    }}
                                    className="text-xs font-bold text-red-600 hover:underline"
                                >
                                    Disconnect
                                </button>
                            </div>
                            <div className="font-mono text-xs">{shortenAddress(ethAddress!)}</div>
                            <div className="text-xs text-gray-600">Sepolia Testnet</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Only Stacks connected
    if (stxConnected) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="px-4 py-2 bg-orange-500 text-white neo-border neo-shadow-sm font-black uppercase text-sm transition-all neo-hover flex items-center gap-2"
                >
                    <Wallet className="w-4 h-4" />
                    Stacks
                    <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white neo-border neo-shadow-lg p-4 space-y-3 z-50">
                        {/* Stacks Wallet */}
                        <div className="pb-3 border-b-2 border-black">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black uppercase text-xs text-orange-500">Stacks Connected</span>
                                <button
                                    onClick={() => {
                                        disconnectStacks();
                                        setShowDropdown(false);
                                    }}
                                    className="text-xs font-bold text-red-600 hover:underline"
                                >
                                    Disconnect
                                </button>
                            </div>
                            <div className="font-mono text-xs mb-1">{shortenAddress(stxAddress!)}</div>
                            <div className="text-xs text-gray-600">{formatStx(balance)}</div>
                        </div>

                        {/* Connect Ethereum */}
                        <div>
                            <div className="font-black uppercase text-xs text-gray-400 mb-2">Ethereum Not Connected</div>
                            <button
                                onClick={() => {
                                    openEthModal();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-2 bg-blue-500 text-white neo-border neo-shadow-sm font-bold text-sm transition-all neo-hover"
                            >
                                Connect Ethereum
                            </button>
                            <p className="text-xs text-gray-600 mt-1">For bridging USDC</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Only Ethereum connected
    if (ethConnected) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="px-4 py-2 bg-blue-500 text-white neo-border neo-shadow-sm font-black uppercase text-sm transition-all neo-hover flex items-center gap-2"
                >
                    <Wallet className="w-4 h-4" />
                    Ethereum
                    <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white neo-border neo-shadow-lg p-4 space-y-3 z-50">
                        {/* Connect Stacks */}
                        <div className="pb-3 border-b-2 border-black">
                            <div className="font-black uppercase text-xs text-gray-400 mb-2">Stacks Not Connected</div>
                            <button
                                onClick={async () => {
                                    await connectStacks();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-2 bg-orange-500 text-white neo-border neo-shadow-sm font-bold text-sm transition-all neo-hover"
                            >
                                Connect Stacks
                            </button>
                            <p className="text-xs text-gray-600 mt-1">For content payments</p>
                        </div>

                        {/* Ethereum Wallet */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black uppercase text-xs text-blue-500">Ethereum Connected</span>
                                <button
                                    onClick={() => {
                                        disconnectEth();
                                        setShowDropdown(false);
                                    }}
                                    className="text-xs font-bold text-red-600 hover:underline"
                                >
                                    Disconnect
                                </button>
                            </div>
                            <div className="font-mono text-xs">{shortenAddress(ethAddress!)}</div>
                            <div className="text-xs text-gray-600">Sepolia Testnet</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Neither wallet connected - show connect options
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white neo-border neo-shadow-sm font-black uppercase text-sm transition-all neo-hover flex items-center gap-2"
            >
                <Wallet className="w-4 h-4" />
                Connect Wallet
                <ChevronDown className="w-4 h-4" />
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white neo-border neo-shadow-lg p-4 space-y-3 z-50">
                    <div className="font-black uppercase text-sm mb-3">Choose Wallet to Connect</div>

                    {/* Connect Stacks */}
                    <div className="pb-3 border-b-2 border-black">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-black uppercase text-xs text-orange-500">Stacks Wallet</span>
                            <span className="text-xs text-gray-600">Recommended</span>
                        </div>
                        <button
                            onClick={async () => {
                                await connectStacks();
                                setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2 bg-orange-500 text-white neo-border neo-shadow-sm font-bold text-sm transition-all neo-hover"
                        >
                            Connect Stacks
                        </button>
                        <p className="text-xs text-gray-600 mt-1">For content payments & earnings</p>
                    </div>

                    {/* Connect Ethereum */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-black uppercase text-xs text-blue-500">Ethereum Wallet</span>
                            <span className="text-xs text-gray-600">Optional</span>
                        </div>
                        <button
                            onClick={() => {
                                openEthModal();
                                setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2 bg-blue-500 text-white neo-border neo-shadow-sm font-bold text-sm transition-all neo-hover"
                        >
                            Connect Ethereum
                        </button>
                        <p className="text-xs text-gray-600 mt-1">For bridging USDC to USDCx</p>
                    </div>
                </div>
            )}
        </div>
    );
}

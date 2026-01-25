'use client';

import { SimpleBridge } from '@/components/bridge/simple-bridge';
import { ArrowLeft, ExternalLink, Zap, Shield, Coins } from 'lucide-react';
import Link from 'next/link';

export default function BridgePage() {
    return (
        <div className="min-h-screen grid-bg py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase hover:underline mb-4 bg-white p-2 neo-border neo-shadow-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-black uppercase mb-4 bg-white inline-block px-4 py-2 neo-border neo-shadow">
                        Bridge USDC
                    </h1>
                    <p className="text-xl font-bold text-gray-700 bg-yellow-300 inline-block px-2 py-1 neo-border">
                        Get USDCx on Stacks to pay for premium content.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Bridge Component Column */}
                    <div>
                        <SimpleBridge />

                        <div className="mt-8 bg-black text-white p-6 neo-border neo-shadow">
                            <h3 className="text-xl font-black uppercase mb-4 text-cyan-400">
                                How it works
                            </h3>
                            <ol className="space-y-4 font-medium">
                                <li className="flex gap-3">
                                    <span className="bg-cyan-400 text-black w-6 h-6 flex items-center justify-center font-bold rounded-sm flex-shrink-0">1</span>
                                    <span>Connect your Ethereum (Sepolia) and Stacks Testnet wallets.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="bg-cyan-400 text-black w-6 h-6 flex items-center justify-center font-bold rounded-sm flex-shrink-0">2</span>
                                    <span>Enter the amount of USDC you want to move to Stacks.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="bg-cyan-400 text-black w-6 h-6 flex items-center justify-center font-bold rounded-sm flex-shrink-0">3</span>
                                    <span>Approve & Deposit. Wait ~15 mins for the network to mint your USDCx.</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 neo-border neo-shadow">
                            <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                                <Zap className="w-6 h-6 text-orange-500" />
                                Why USDCx?
                            </h3>
                            <p className="font-medium text-gray-700 mb-4">
                                USDCx (Bridged USDC) brings stablecoin liquidity to Bitcoin's layer via Stacks.
                                Use it to pay creators instantly without price volatility.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 p-3 border-2 border-orange-200">
                                    <div className="font-black text-orange-800 text-lg">$1.00</div>
                                    <div className="text-xs font-bold uppercase text-orange-600">Stable Value</div>
                                </div>
                                <div className="bg-blue-50 p-3 border-2 border-blue-200">
                                    <div className="font-black text-blue-800 text-lg">~1s</div>
                                    <div className="text-xs font-bold uppercase text-blue-600">Finality</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-cyan-400 p-6 neo-border neo-shadow">
                            <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                                <Coins className="w-6 h-6" />
                                Need Testnet USDC?
                            </h3>
                            <p className="font-bold mb-4">
                                You can get free Sepolia USDC from the official Circle Faucet.
                            </p>
                            <a
                                href="https://faucet.circle.com/"
                                target="_blank"
                                className="block w-full bg-white text-black py-3 text-center font-black uppercase neo-border hover:bg-gray-50 transition-colors"
                            >
                                Go to Circle Faucet <ExternalLink className="w-4 h-4 inline ml-1" />
                            </a>
                        </div>

                        <div className="bg-yellow-300 p-6 neo-border neo-shadow">
                            <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-black" />
                                Secure Bridge
                            </h3>
                            <p className="font-bold text-sm">
                                Powered by Circle's Cross-Chain Transfer Protocol (CCTP) and Stacks Attestation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

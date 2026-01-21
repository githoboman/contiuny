'use client';

import Link from 'next/link';
import { useWallet } from '@/components/wallet/wallet-provider';
import { CheckCircle2, DollarSign, Shield, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatorsPage() {
    const { isConnected } = useWallet();
    const router = useRouter();

    const handleGetStarted = () => {
        if (isConnected) {
            router.push('/creators/dashboard');
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen grid-bg">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-block mb-8">
                        <div className="px-6 py-2 bg-cyan-400 neo-border neo-shadow-sm inline-block rotate-[2deg]">
                            <span className="font-bold text-sm uppercase tracking-wider">
                                🎨 Creator Portal
                            </span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none uppercase">
                        <span className="block">Earn With</span>
                        <span className="block gradient-text">Your Content</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-bold mb-8 max-w-2xl">
                        Publish content. Set prices in <span className="text-orange-500">STX</span> or <span className="text-cyan-500">USDCx</span>. Get paid directly. No middlemen.
                    </p>

                    {!isConnected ? (
                        <div className="bg-yellow-300 neo-border neo-shadow p-6 mb-8 max-w-xl">
                            <p className="font-black text-lg mb-2">
                                👆 CONNECT WALLET TO START
                            </p>
                            <p className="font-medium">
                                Use the "Connect Wallet" button in the header above
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-orange-500 text-white neo-border neo-shadow font-black text-lg uppercase tracking-wide transition-all neo-hover inline-flex items-center gap-2"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-black text-white py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase">
                        Why Create on <span className="text-orange-500">CostaXR</span>?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Feature 1 */}
                        <div className="bg-orange-500 neo-border-thick p-8">
                            <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                                <DollarSign className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 uppercase">Dual Pricing</h3>
                            <p className="font-medium">
                                Set prices in STX and USDCx. Reach more users. Maximize earnings.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-cyan-400 text-black neo-border-thick p-8">
                            <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                                <Shield className="w-8 h-8 text-cyan-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 uppercase">Full Control</h3>
                            <p className="font-medium">
                                Your content. Your prices. Update anytime. Deactivate anytime.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-yellow-300 text-black neo-border-thick p-8">
                            <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                                <Zap className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 uppercase">Instant Payments</h3>
                            <p className="font-medium">
                                Get paid directly to your wallet. No waiting. No processing fees.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-pink-500 neo-border-thick p-8">
                            <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 uppercase">Bitcoin Secured</h3>
                            <p className="font-medium">
                                Built on Stacks. Every transaction secured by Bitcoin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase">
                        How It <span className="gradient-text">Works</span>
                    </h2>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-orange-500 neo-border flex items-center justify-center">
                                <span className="text-3xl font-black text-white">1</span>
                            </div>
                            <div className="bg-white neo-border p-6 flex-1">
                                <h3 className="text-xl font-black mb-2 uppercase">Connect Wallet</h3>
                                <p className="font-medium">Use Leather, Xverse, or Hiro wallet.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-cyan-400 neo-border flex items-center justify-center">
                                <span className="text-3xl font-black">2</span>
                            </div>
                            <div className="bg-white neo-border p-6 flex-1">
                                <h3 className="text-xl font-black mb-2 uppercase">Get USDCx (Optional)</h3>
                                <p className="font-medium">Get test USDCx instantly or bridge from Ethereum. Or just use STX.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-yellow-300 neo-border flex items-center justify-center">
                                <span className="text-3xl font-black">3</span>
                            </div>
                            <div className="bg-white neo-border p-6 flex-1">
                                <h3 className="text-xl font-black mb-2 uppercase">Register Content</h3>
                                <p className="font-medium">Upload to IPFS. Set prices. Publish.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-pink-500 neo-border flex items-center justify-center">
                                <span className="text-3xl font-black text-white">4</span>
                            </div>
                            <div className="bg-white neo-border p-6 flex-1">
                                <h3 className="text-xl font-black mb-2 uppercase">Start Earning</h3>
                                <p className="font-medium">Users pay. You earn. 100% goes to you.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-cyan-400 py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase">
                            Ready to Create?
                        </h2>

                        {isConnected ? (
                            <button
                                onClick={handleGetStarted}
                                className="px-10 py-5 bg-white text-black neo-border-thick neo-shadow-lg font-black text-xl uppercase tracking-wide transition-all hover:scale-105 inline-flex items-center gap-3"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        ) : (
                            <div className="bg-white neo-border-thick p-8 inline-block">
                                <p className="font-black text-xl mb-2">Connect your wallet to start</p>
                                <p className="font-medium text-gray-700">
                                    Already a creator? <Link href="/creators/dashboard" className="text-orange-500 hover:underline font-black">Go to Dashboard</Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

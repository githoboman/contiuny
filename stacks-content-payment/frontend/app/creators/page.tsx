'use client';

import Link from 'next/link';
import { useWallet } from '@/components/wallet/wallet-provider';
import { CheckCircle2, DollarSign, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatorsPage() {
    const { isConnected } = useWallet();
    const router = useRouter();

    const handleGetStarted = () => {
        if (isConnected) {
            router.push('/creators/dashboard');
        } else {
            // Scroll to top where connect wallet button is
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                        Become a Creator
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8">
                        Publish your content and earn with <span className="font-bold text-orange-600">USDCx</span> on Stacks
                    </p>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        Join the decentralized content economy. Set your own prices, get paid directly to your wallet, and maintain full control over your work.
                    </p>

                    {!isConnected ? (
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
                            <p className="text-yellow-800 font-medium mb-2">
                                👆 Connect your wallet to get started
                            </p>
                            <p className="text-sm text-yellow-700">
                                Use the "Connect Wallet" button in the header above
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-lg font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Go to Creator Dashboard →
                        </button>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Join as a Creator?</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-orange-500">
                            <div className="flex items-start gap-4">
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Dual Payment Options</h3>
                                    <p className="text-gray-600">
                                        Set prices in both <strong>STX</strong> and <strong>USDCx</strong>. Reach users who prefer native tokens or stablecoins.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Full Control</h3>
                                    <p className="text-gray-600">
                                        You own your content. Update prices, deactivate, or reactivate anytime. No middleman taking cuts.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Zap className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Instant Payments</h3>
                                    <p className="text-gray-600">
                                        Get paid directly to your wallet when users purchase. No waiting for payouts or processing fees.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500">
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Blockchain Verified</h3>
                                    <p className="text-gray-600">
                                        All transactions recorded on Stacks blockchain. Transparent, immutable, and secured by Bitcoin.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-gradient-to-r from-orange-600 to-blue-600 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-white">
                        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

                        <div className="space-y-8">
                            <div className="flex gap-6 items-start">
                                <div className="bg-white text-orange-600 font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                                    <p className="text-orange-100">
                                        Use Leather, Xverse, or Hiro wallet to connect to the platform.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="bg-white text-orange-600 font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Get USDCx (Optional)</h3>
                                    <p className="text-orange-100">
                                        Get test USDCx instantly or bridge from Ethereum. You can also just use STX.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="bg-white text-orange-600 font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Register Your Content</h3>
                                    <p className="text-orange-100">
                                        Upload to IPFS, set your prices in STX and/or USDCx, and publish.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="bg-white text-orange-600 font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Start Earning</h3>
                                    <p className="text-orange-100">
                                        Users pay to access your content. Payments go directly to your wallet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Start Earning?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join creators who are already earning with decentralized content payments
                    </p>

                    {isConnected ? (
                        <button
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-lg font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Go to Creator Dashboard →
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Connect your wallet to get started
                            </p>
                            <p className="text-sm text-gray-500">
                                Already a creator? <Link href="/creators/dashboard" className="text-orange-600 hover:underline font-medium">Go to Dashboard</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/wallet/wallet-provider';
import { DollarSign, TrendingUp, FileText, Users } from 'lucide-react';

interface CreatorStats {
    totalStx: number;
    totalUsdcx: number;
    paymentCount: number;
    contentCount: number;
}

export default function CreatorEarningsPage() {
    const { address } = useWallet();
    const [stats, setStats] = useState<CreatorStats>({
        totalStx: 0,
        totalUsdcx: 0,
        paymentCount: 0,
        contentCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (address) {
            loadEarnings();
        }
    }, [address]);

    const loadEarnings = async () => {
        try {
            setLoading(true);
            // TODO: Call backend API to get creator earnings
            // For now, show demo data
            setStats({
                totalStx: 2500000, // 2.5 STX
                totalUsdcx: 500, // $5.00
                paymentCount: 3,
                contentCount: 2
            });
        } catch (error) {
            console.error('Failed to load earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!address) {
        return (
            <div className="min-h-screen grid-bg">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-2xl mx-auto bg-yellow-300 neo-border neo-shadow p-8 text-center">
                        <h2 className="text-2xl font-black uppercase mb-4">Connect Wallet</h2>
                        <p className="font-bold">Please connect your wallet to view your creator earnings.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid-bg">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-5xl font-black uppercase mb-2">Creator Earnings</h1>
                        <p className="text-xl font-bold text-gray-700">Track your revenue from content sales</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total STX Earned */}
                        <div className="bg-gradient-to-br from-orange-400 to-pink-500 neo-border neo-shadow p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-white p-2 neo-border">
                                    <DollarSign className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="font-black uppercase text-white">STX Earned</h3>
                            </div>
                            <p className="text-4xl font-black text-white">
                                {(stats.totalStx / 1_000_000).toFixed(2)}
                            </p>
                            <p className="text-sm font-bold text-white/80 mt-1">STX</p>
                        </div>

                        {/* Total USDCx Earned */}
                        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 neo-border neo-shadow p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-white p-2 neo-border">
                                    <TrendingUp className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="font-black uppercase text-white">USDCx Earned</h3>
                            </div>
                            <p className="text-4xl font-black text-white">
                                ${(stats.totalUsdcx / 100).toFixed(2)}
                            </p>
                            <p className="text-sm font-bold text-white/80 mt-1">USD</p>
                        </div>

                        {/* Total Sales */}
                        <div className="bg-gradient-to-br from-green-400 to-emerald-500 neo-border neo-shadow p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-white p-2 neo-border">
                                    <Users className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="font-black uppercase text-white">Total Sales</h3>
                            </div>
                            <p className="text-4xl font-black text-white">{stats.paymentCount}</p>
                            <p className="text-sm font-bold text-white/80 mt-1">Purchases</p>
                        </div>

                        {/* Content Published */}
                        <div className="bg-gradient-to-br from-purple-400 to-pink-500 neo-border neo-shadow p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-white p-2 neo-border">
                                    <FileText className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="font-black uppercase text-white">Content</h3>
                            </div>
                            <p className="text-4xl font-black text-white">{stats.contentCount}</p>
                            <p className="text-sm font-bold text-white/80 mt-1">Published</p>
                        </div>
                    </div>

                    {/* Recent Sales */}
                    <div className="bg-white neo-border neo-shadow p-6">
                        <h2 className="text-2xl font-black uppercase mb-6">Recent Sales</h2>

                        <div className="space-y-4">
                            {/* Sample sale */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 neo-border">
                                <div className="flex-1">
                                    <p className="font-black">Premium Content #1</p>
                                    <p className="text-sm text-gray-600 font-mono">
                                        Buyer: ST1PQ...PGZGM
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg">0.50 STX</p>
                                    <p className="text-sm text-gray-600">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 neo-border">
                                <div className="flex-1">
                                    <p className="font-black">Premium Content #2</p>
                                    <p className="text-sm text-gray-600 font-mono">
                                        Buyer: ST2AB...XY123
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg">$1.00</p>
                                    <p className="text-sm text-gray-600">5 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 neo-border">
                                <div className="flex-1">
                                    <p className="font-black">Premium Content #1</p>
                                    <p className="text-sm text-gray-600 font-mono">
                                        Buyer: ST3CD...ZW456
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg">1.00 STX</p>
                                    <p className="text-sm text-gray-600">1 day ago</p>
                                </div>
                            </div>
                        </div>

                        {stats.paymentCount === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-bold">No sales yet</p>
                                <p className="text-sm text-gray-400">Your earnings will appear here when users purchase your content</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

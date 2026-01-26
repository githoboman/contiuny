'use client';

import { useWallet } from '@/components/wallet/wallet-provider';
import { useState, useEffect } from 'react';
import { Loader2, DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { formatStx, formatUsd } from '@/lib/utils';
import { NeoCard } from '@/components/ui/neo-card';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoBadge } from '@/components/ui/neo-badge';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

// Mock data for visualization
const WEEKLY_DATA = [
    { day: 'Mon', value: 120 },
    { day: 'Tue', value: 250 },
    { day: 'Wed', value: 180 },
    { day: 'Thu', value: 310 },
    { day: 'Fri', value: 450 },
    { day: 'Sat', value: 380 },
    { day: 'Sun', value: 520 },
];

export default function EarningsPage() {
    const { address, isConnected } = useWallet();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarningsStx: 0,
        totalEarningsUsdc: 0,
        pendingPayouts: 0,
        monthEarnings: 0
    });

    useEffect(() => {
        async function loadEarnings() {
            if (!address) return;

            try {
                setLoading(true);
                const response = await api.getCreatorRevenue(address);
                setStats({
                    totalEarningsStx: response.data?.earnings?.totalStx || 0,
                    totalEarningsUsdc: response.data?.earnings?.totalUsdcx || 0,
                    pendingPayouts: 0, // Not currently tracked by API
                    monthEarnings: response.data?.totalRevenue || 0
                });
            } catch (err) {
                console.error('Failed to load earnings:', err);
            } finally {
                setLoading(false);
            }
        }

        if (isConnected && address) {
            loadEarnings();
        }
    }, [address, isConnected]);

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <NeoCard className="max-w-md mx-auto py-12">
                    <h2 className="text-2xl font-black uppercase mb-4">Connect Wallet</h2>
                    <p className="text-gray-600 mb-6">Connect your Stacks wallet to view your earnings.</p>
                </NeoCard>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen grid-bg flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen grid-bg pb-20">
            {/* Header */}
            <div className="bg-[#FF6B00] border-b-4 border-black py-12 mb-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-black uppercase text-black tracking-tight mb-2">
                        Earnings
                    </h1>
                    <p className="font-bold text-black/70 uppercase tracking-widest">
                        Performance Dashboard
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total STX */}
                    <NeoCard variant="dark">
                        <div className="flex items-start justify-between mb-4">
                            <span className="font-black uppercase text-sm opacity-80">Total STX</span>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="text-4xl font-black mb-2">
                            {formatStx(stats.totalEarningsStx)}
                        </div>
                        <NeoBadge variant="success" animatePulse className="text-[10px]">
                            +12% this week
                        </NeoBadge>
                    </NeoCard>

                    {/* Total USDC */}
                    <NeoCard variant="highlight">
                        <div className="flex items-start justify-between mb-4">
                            <span className="font-black uppercase text-sm opacity-80">Total USDC</span>
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="text-4xl font-black mb-2">
                            ${stats.totalEarningsUsdc}
                        </div>
                        <div className="text-xs font-bold opacity-70">
                            Available to bridge
                        </div>
                    </NeoCard>

                    {/* Pending */}
                    <NeoCard>
                        <div className="flex items-start justify-between mb-4">
                            <span className="font-black uppercase text-sm text-gray-500">Pending</span>
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                        <div className="text-4xl font-black mb-2 text-gray-400">
                            ${stats.pendingPayouts}
                        </div>
                        <div className="text-xs font-bold text-gray-400">
                            Processing...
                        </div>
                    </NeoCard>

                    {/* Action */}
                    <NeoCard className="flex flex-col justify-center items-center text-center space-y-4">
                        <p className="font-black uppercase text-sm">Ready to cash out?</p>
                        <NeoButton className="w-full">
                            Withdraw Funds
                        </NeoButton>
                    </NeoCard>
                </div>

                {/* Brutalist Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <NeoCard className="h-full min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black uppercase">Revenue History</h3>
                                <NeoButton variant="ghost" neoSize="sm" className="text-xs">
                                    Last 7 Days <ArrowUpRight className="w-3 h-3 ml-1" />
                                </NeoButton>
                            </div>

                            {/* Bar Chart Container */}
                            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-4 pb-4 border-b-4 border-black">
                                {WEEKLY_DATA.map((item, index) => (
                                    <div key={item.day} className="flex flex-col items-center gap-2 group w-full">
                                        <div className="relative w-full flex items-end h-[250px]">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(item.value / 600) * 100}%` }}
                                                transition={{
                                                    type: "spring",
                                                    damping: 15,
                                                    delay: index * 0.1
                                                }}
                                                className="w-full bg-black group-hover:bg-[#FF6B00] transition-colors border-2 border-black"
                                            />
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                ${item.value}
                                                {/* Little triangle */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-b-transparent border-r-transparent border-l-transparent border-t-black"></div>
                                            </div>
                                        </div>
                                        <span className="font-black uppercase text-xs sm:text-sm">{item.day}</span>
                                    </div>
                                ))}
                            </div>
                        </NeoCard>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-black uppercase mb-4 pl-2 border-l-4 border-[#FF6B00]">Newest Sales</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <NeoCard key={i} className="py-3 px-4 flex items-center justify-between hover:translate-x-1 transition-transform">
                                    <div>
                                        <div className="font-black text-sm">Content #{100 + i}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-500">2 mins ago</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-[#FF6B00]">+$15.00</div>
                                        <div className="text-[10px] font-bold">USDC</div>
                                    </div>
                                </NeoCard>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

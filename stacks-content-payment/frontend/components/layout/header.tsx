'use client';

import Link from 'next/link';
import { ConnectWallet } from '../wallet/connect-wallet';

export function Header() {
    return (
        <header className="border-b-4 border-black bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-3xl font-black uppercase tracking-tight">
                        <span className="gradient-text">COSTAXR</span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link
                            href="/content"
                            className="px-4 py-2 font-bold uppercase text-sm hover:text-orange-500 transition"
                        >
                            Browse
                        </Link>
                        <Link
                            href="/creators"
                            className="px-6 py-2 bg-orange-500 text-white neo-border neo-shadow-sm font-black uppercase text-sm transition-all neo-hover"
                        >
                            Join Creators
                        </Link>
                        <Link
                            href="/creators/earnings"
                            className="px-4 py-2 font-bold uppercase text-sm hover:text-green-500 transition"
                        >
                            💰 Earnings
                        </Link>
                        <ConnectWallet />
                    </nav>
                </div>
            </div>
        </header>
    );
}

'use client';

import Link from 'next/link';
import { MultiWalletConnect } from '../wallet/multi-wallet-connect';

export function Header() {
    return (
        <header className="bg-black border-b-4 border-[#FF6B00] shadow-[0_8px_0px_0px_#FF6B00] sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black uppercase tracking-tight text-[#FF6B00]">
                        COSTAXR
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link
                            href="/content"
                            className="text-white font-bold uppercase text-sm hover:text-[#FF6B00] transition-colors"
                        >
                            Browse
                        </Link>
                        <Link
                            href="/creators"
                            className="text-white font-bold uppercase text-sm hover:text-[#FF6B00] transition-colors"
                        >
                            Earnings
                        </Link>

                        <Link
                            href="/creators/dashboard"
                            className="text-white font-bold uppercase text-sm hover:text-[#FF6B00] transition-colors"
                        >
                            Bridge
                        </Link>
                        <MultiWalletConnect />
                    </nav>
                </div>
            </div>
        </header>
    );
}

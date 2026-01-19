'use client';

import Link from 'next/link';
import { ConnectWallet } from '../wallet/connect-wallet';

export function Header() {
    return (
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        Content Pay
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link href="/content" className="hover:text-blue-600 transition">
                            Browse Content
                        </Link>
                        <Link
                            href="/creators"
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-medium shadow-sm"
                        >
                            Join Creators
                        </Link>
                        <ConnectWallet />
                    </nav>
                </div>
            </div>
        </header>
    );
}

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
                        <Link href="/creator/dashboard" className="hover:text-blue-600 transition">
                            Creator Dashboard
                        </Link>
                        <ConnectWallet />
                    </nav>
                </div>
            </div>
        </header>
    );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MultiWalletConnect } from '../wallet/multi-wallet-connect';
import { Menu, X } from 'lucide-react';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-black border-b-4 border-[#FF6B00] shadow-[0_8px_0px_0px_#FF6B00] sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black uppercase tracking-tight text-[#FF6B00]">
                        COSTAXR
                    </Link>

                    {/* Desktop Naivgation */}
                    <nav className="hidden md:flex items-center gap-6">
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

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-[#FF6B00]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-black border-t-4 border-[#FF6B00] p-4 absolute w-full left-0 top-[100%] shadow-[0_8px_0px_0px_#FF6B00]">
                    <nav className="flex flex-col gap-4">
                        <Link
                            href="/content"
                            className="text-white font-bold uppercase text-lg hover:text-[#FF6B00] transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Browse
                        </Link>
                        <Link
                            href="/creators"
                            className="text-white font-bold uppercase text-lg hover:text-[#FF6B00] transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Earnings
                        </Link>
                        <Link
                            href="/creators/dashboard"
                            className="text-white font-bold uppercase text-lg hover:text-[#FF6B00] transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Bridge
                        </Link>
                        <div className="pt-4 border-t-2 border-dashed border-gray-800">
                            <MultiWalletConnect />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

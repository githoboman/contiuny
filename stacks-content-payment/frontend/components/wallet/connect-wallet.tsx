'use client';

import { useWallet } from './wallet-provider';
import { formatStx, shortenAddress } from '@/lib/utils';

export function ConnectWallet() {
    const { address, isConnected, balance, connect, disconnect } = useWallet();

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-sm">
                    <div className="font-medium">{shortenAddress(address)}</div>
                    <div className="text-gray-500">{formatStx(balance)}</div>
                </div>
                <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
            Connect Wallet
        </button>
    );
}

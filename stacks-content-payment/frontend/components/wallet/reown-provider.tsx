'use client'

import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter, queryClient, projectId, networks } from '@/lib/ethereum/wallet'
import { sepolia } from '@reown/appkit/networks'

// Initialize AppKit
// Initialize AppKit
createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [sepolia],
    defaultNetwork: sepolia,
    metadata: {
        name: 'COSTAXR',
        description: 'Decentralized Content Payments on Stacks',
        url: 'https://costaxr.vercel.app', // MUST match your actual Vercel domain
        icons: ['https://assets.reown.com/reown-profile-pic.png']
    },
    features: {
        analytics: true,
        email: false,
        socials: [],
        onramp: false
    },
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#FF6B00',
        '--w3m-border-radius-master': '1px'
    }
})

export function ReownProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}

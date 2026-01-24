import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Config, cookieStorage, createStorage, http, fallback } from 'wagmi'
import { ETHEREUM_CONFIG } from './constants'

// Get project ID from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // Fallback to a demo ID or placeholder

if (!projectId) {
    console.warn('Project ID is not defined')
}

export const networks = [sepolia]

// Set up Wagmi Adapter with fallback transports for better reliability
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks,
    transports: {
        [sepolia.id]: fallback([
            http(ETHEREUM_CONFIG.RPC_URL),
            ...ETHEREUM_CONFIG.FALLBACK_RPC_URLS.map(url => http(url))
        ])
    }
})

export const config = wagmiAdapter.wagmiConfig

// Set up QueryClient
export const queryClient = new QueryClient()

if (typeof window !== 'undefined') {
    // Reown AppKit = WalletConnect v3 (supports 300+ wallets)
    createAppKit({
        adapters: [wagmiAdapter],
        projectId,
        networks: [sepolia],
        defaultNetwork: sepolia,
        metadata: {
            name: 'Stacks Content Pay',
            description: 'Bridge USDC to Stacks with WalletConnect',
            url: 'https://stacks-content-pay.vercel.app',
            icons: ['https://assets.reown.com/reown-profile-pic.png']
        },
        features: {
            analytics: true,
            email: false, // Disable email login for now
            socials: [], // Disable social logins
            onramp: false // Disable onramp for now
        },
        themeMode: 'light',
        themeVariables: {
            '--w3m-accent': '#22c55e' // Match your brand colors
        }
    })
}

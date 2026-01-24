// Ethereum wallet and bridge integration constants
export const ETHEREUM_CONFIG = {
    // Sepolia Testnet
    CHAIN_ID: 11155111,
    CHAIN_NAME: 'Sepolia',
    RPC_URL: 'https://rpc.ankr.com/eth_sepolia', // Ankr - more reliable than publicnode
    // Fallback RPC endpoints in case the primary one fails
    FALLBACK_RPC_URLS: [
        'https://eth-sepolia.public.blastapi.io',
        'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
        'https://rpc.sepolia.org',
        'https://ethereum-sepolia-rpc.publicnode.com',
    ],
    EXPLORER: 'https://sepolia.etherscan.io',

    // Circle xReserve Contract (Sepolia)
    XRESERVE_ADDRESS: '0x008888878f94C0d87defdf0B07f46B93C1934442',

    // USDC Contract (Sepolia)
    USDC_ADDRESS: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',

    // Stacks Domain ID for xReserve
    STACKS_DOMAIN: 10003,
} as const;

// Minimal USDC ERC-20 ABI (only what we need)
export const USDC_ABI = [
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
    },
    {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }]
    },
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
    }
] as const;

// xReserve Contract ABI (minimal - only depositToRemote)
export const XRESERVE_ABI = [
    {
        name: 'depositToRemote',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'remoteDomain', type: 'uint32' },
            { name: 'recipient', type: 'bytes32' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: []
    }
] as const;

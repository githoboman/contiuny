/**
 * Centralized configuration for CostaXR platform
 * All contract addresses and network settings in one place
 */

export const CONTRACTS = {
    PAYMENT_HANDLER: process.env.NEXT_PUBLIC_PAYMENT_HANDLER!,
    CONTENT_REGISTRY: process.env.NEXT_PUBLIC_CONTENT_REGISTRY!,
    ACCESS_CONTROL: process.env.NEXT_PUBLIC_ACCESS_CONTROL!,
    MOCK_USDC: process.env.NEXT_PUBLIC_MOCK_USDC!,
    USDCX: process.env.NEXT_PUBLIC_USDCX_ADDRESS ||
        process.env.NEXT_PUBLIC_MOCK_USDC ||
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx',
};

export const NETWORK = {
    TYPE: (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as 'mainnet' | 'testnet',
    STACKS_API: process.env.NEXT_PUBLIC_STACKS_API || 'https://api.testnet.hiro.so',
};

export const API = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
};

// Validation
const validateConfig = () => {
    const missing: string[] = [];

    if (!CONTRACTS.PAYMENT_HANDLER) missing.push('NEXT_PUBLIC_PAYMENT_HANDLER');
    if (!CONTRACTS.CONTENT_REGISTRY) missing.push('NEXT_PUBLIC_CONTENT_REGISTRY');
    if (!CONTRACTS.ACCESS_CONTROL) missing.push('NEXT_PUBLIC_ACCESS_CONTROL');
    if (!CONTRACTS.MOCK_USDC) missing.push('NEXT_PUBLIC_MOCK_USDC');

    if (missing.length > 0) {
        console.warn('⚠️ Missing environment variables:', missing.join(', '));
    }
};

// Run validation in development
if (process.env.NODE_ENV === 'development') {
    validateConfig();
}

export default {
    CONTRACTS,
    NETWORK,
    API,
};

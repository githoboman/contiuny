// Stacks blockchain utilities - WBIP004 compliant wallet connection

import { AppConfig, UserSession } from '@stacks/connect';
import { STACKS_TESTNET, STACKS_MAINNET, StacksNetwork } from '@stacks/network';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    uintCV,
    principalCV,
    bufferCV,
    someCV,
    noneCV,
} from '@stacks/transactions';

// Lazy initialization to avoid SSR issues
let _userSession: UserSession | null = null;

const getUserSession = () => {
    if (typeof window === 'undefined') {
        // Return a mock session for SSR
        return null;
    }

    if (!_userSession) {
        const appConfig = new AppConfig(['store_write', 'publish_data']);
        _userSession = new UserSession({ appConfig });
    }
    return _userSession;
};

export const userSession = getUserSession();

const network: StacksNetwork = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
    ? STACKS_MAINNET
    : STACKS_TESTNET;

export const stacks = {
    get userSession() {
        return getUserSession();
    },

    // Connect wallet using @stacks/connect
    connectWallet: async () => {
        try {
            console.log('Starting wallet connection...');

            const session = getUserSession();
            if (!session) {
                throw new Error('Wallet not available in server-side context');
            }

            // Check if already signed in
            if (session.isUserSignedIn()) {
                console.log('User already signed in');
                const userData = session.loadUserData();
                const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
                console.log('Existing address:', address);
                return address;
            }

            // Check if there's a pending sign in
            if (session.isSignInPending()) {
                console.log('Handling pending sign in...');
                await session.handlePendingSignIn();
                const userData = session.loadUserData();
                const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
                console.log('Address after pending sign in:', address);
                return address;
            }

            // Use new @stacks/connect API
            const { connect, isConnected } = await import('@stacks/connect');

            // Check if already connected
            if (isConnected()) {
                console.log('Already connected via @stacks/connect');
                const { getLocalStorage } = await import('@stacks/connect');
                const userData = getLocalStorage();
                if (userData?.addresses?.stx?.[0]?.address) {
                    const address = userData.addresses.stx[0].address;
                    console.log('Connected address:', address);
                    return address;
                }
            }

            // Connect to wallet
            console.log('Connecting to wallet...');
            const response = await connect({
                appDetails: {
                    name: 'Stacks Content Payment',
                    icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
                }
            });
            console.log('Connect response structure:', response);

            // Handle different possible response structures
            let address: string | undefined;

            // Try format 1: response.addresses.stx[0].address (object format)
            if (response?.addresses && typeof response.addresses === 'object' && !Array.isArray(response.addresses)) {
                const addressesObj = response.addresses as any;
                if (addressesObj.stx?.[0]?.address) {
                    address = addressesObj.stx[0].address;
                }
            }

            // Try format 2: response.addresses[0].address (array format)
            if (!address && Array.isArray(response?.addresses) && response.addresses.length > 0) {
                address = response.addresses[0].address;
            }

            if (address) {
                console.log('Connected address:', address);
                return address;
            }

            // Log the full response to help debug
            console.error('Unexpected response structure:', JSON.stringify(response, null, 2));
            throw new Error('Failed to get address from wallet. Please ensure your wallet is unlocked and try again.');
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    },

    disconnectWallet: async () => {
        const session = getUserSession();
        if (session) {
            session.signUserOut();
        }

        // Also disconnect via @stacks/connect
        const { disconnect } = await import('@stacks/connect');
        disconnect();

        if (typeof window !== 'undefined') {
            localStorage.removeItem('wallet_address');
        }
    },

    isConnected: (): boolean => {
        const session = getUserSession();
        if (typeof window === 'undefined') return false;

        // Check UserSession
        if (session?.isUserSignedIn()) return true;

        // Check @stacks/connect (synchronous check via localStorage)
        try {
            const stored = localStorage.getItem('stacks-connect-storage');
            if (stored) {
                const data = JSON.parse(stored);
                return !!data?.addresses?.stx?.[0]?.address;
            }
        } catch (e) {
            // Ignore parse errors
        }

        return false;
    },

    getAddress: (): string | null => {
        const session = getUserSession();
        if (session?.isUserSignedIn()) {
            const userData = session.loadUserData();
            return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
        }

        // Check @stacks/connect storage
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('stacks-connect-storage');
                if (stored) {
                    const data = JSON.parse(stored);
                    return data?.addresses?.stx?.[0]?.address || null;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        return null;
    },

    // Transfer functions for direct payments
    async transferStx(recipient: string, amount: number, memo?: string): Promise<string> {
        console.log('transferStx called:', { recipient, amount, memo });

        const { openSTXTransfer } = await import('@stacks/connect');

        return new Promise((resolve, reject) => {
            openSTXTransfer({
                recipient,
                amount: amount.toString(),
                memo,
                network,
                anchorMode: AnchorMode.Any,
                onFinish: (data) => {
                    console.log('STX transfer submitted:', data.txId);
                    resolve(data.txId);
                },
                onCancel: () => {
                    reject(new Error('Transaction cancelled by user'));
                },
            });
        });
    },

    async transferToken(recipient: string, amount: number, tokenContract: string, memo?: string): Promise<string> {
        console.log('transferToken called:', { recipient, amount, tokenContract, memo });

        const { openContractCall } = await import('@stacks/connect');

        // Parse token contract address
        const [contractAddress, contractName] = tokenContract.split('.');

        // Create buffer for memo if present
        // Stacks memos are 34 bytes max
        // For SIP-10 transfer, the last arg is usually memo (optional)

        return new Promise((resolve, reject) => {
            openContractCall({
                contractAddress,
                contractName,
                functionName: 'transfer',
                functionArgs: [
                    uintCV(amount),           // amount
                    principalCV(userSession!.loadUserData().profile.stxAddress.testnet), // sender (self)
                    principalCV(recipient),   // recipient
                    memo ? someCV(bufferCV(Buffer.from(memo))) : noneCV() // memo (optional)
                ],
                network,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
                onFinish: (data) => {
                    console.log('Token transfer submitted:', data.txId);
                    resolve(data.txId);
                },
                onCancel: () => {
                    reject(new Error('Transaction cancelled by user'));
                },
            });
        });
    },

    // Contract-based payment functions (legacy/alternative)
    async payWithSTX(contentId: number, price: number, userAddress: string): Promise<string> {
        console.log('payWithSTX called:', { contentId, price, userAddress });

        if (!userAddress) {
            console.error('payWithSTX: No address found');
            throw new Error('Wallet not connected');
        }

        const contractAddress = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[0] || '';
        const contractName = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[1] || 'payment-handler';

        // Import openContractCall dynamically to avoid SSR issues
        const { openContractCall } = await import('@stacks/connect');

        return new Promise((resolve, reject) => {
            openContractCall({
                contractAddress,
                contractName,
                functionName: 'pay-for-content-stx',
                functionArgs: [uintCV(contentId)],
                network,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
                onFinish: (data) => {
                    console.log('STX payment transaction submitted:', data.txId);
                    resolve(data.txId);
                },
                onCancel: () => {
                    reject(new Error('Transaction cancelled by user'));
                },
            });
        });
    },

    async payWithToken(contentId: number, tokenContract: string, userAddress: string): Promise<string> {
        console.log('payWithToken called:', { contentId, tokenContract, userAddress });

        if (!userAddress) {
            console.error('payWithToken: No address provided');
            throw new Error('Wallet not connected');
        }

        const contractAddress = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[0] || '';
        const contractName = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[1] || 'payment-handler';

        // Parse token contract address
        const [tokenAddr, tokenName] = tokenContract.split('.');

        // Import openContractCall dynamically to avoid SSR issues
        const { openContractCall } = await import('@stacks/connect');

        return new Promise((resolve, reject) => {
            openContractCall({
                contractAddress,
                contractName,
                functionName: 'pay-for-content-token',
                functionArgs: [
                    uintCV(contentId),
                    principalCV(tokenContract)
                ],
                network,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow, // Token transfers need this
                onFinish: (data) => {
                    console.log('Token payment transaction submitted:', data.txId);
                    resolve(data.txId);
                },
                onCancel: () => {
                    reject(new Error('Transaction cancelled by user'));
                },
            });
        });
    },

    // Get STX balance with retry logic
    async getBalance(address: string, retries = 2): Promise<number> {
        const apiUrls = [
            'https://api.testnet.hiro.so',
            'https://api.hiro.so', // Alternative endpoint
        ];

        for (let attempt = 0; attempt <= retries; attempt++) {
            for (const apiUrl of apiUrls) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                    const response = await fetch(`${apiUrl}/extended/v1/address/${address}/balances`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                        mode: 'cors',
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        console.warn(`Failed to fetch balance from ${apiUrl}:`, response.status);
                        continue; // Try next URL
                    }


                    // Check if response is actually JSON
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        console.warn(`API ${apiUrl} returned non-JSON response`);
                        continue; // Try next URL
                    }

                    const data = await response.json();
                    const balance = parseInt(data.stx.balance) || 0;
                    return balance; // Success!

                } catch (error: any) {
                    // Network error, timeout, or aborted
                    if (error.name === 'AbortError') {
                        console.warn(`Request to ${apiUrl} timed out`);
                    } else {
                        console.warn(`Error fetching from ${apiUrl}:`, error.message);
                    }
                    // Continue to next URL or retry
                }
            }
        }

        // All attempts failed
        console.error('Failed to fetch balance after all retries');
        return 0;
    },

    // Monitor transaction
    async getTransactionStatus(txId: string): Promise<any> {
        const apiUrl = (network as any).coreApiUrl || 'https://api.testnet.hiro.so';

        const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
        return response.json();
    },
};

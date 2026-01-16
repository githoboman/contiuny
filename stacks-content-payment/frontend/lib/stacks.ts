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
            const response = await connect();

            if (response?.addresses?.stx?.[0]?.address) {
                const address = response.addresses.stx[0].address;
                console.log('Connected address:', address);
                return address;
            }

            throw new Error('Failed to get address from wallet');
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

    // Payment functions
    async payWithSTX(contentId: number, price: number): Promise<string> {
        const address = stacks.getAddress();
        if (!address) throw new Error('Wallet not connected');

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

    async payWithToken(contentId: number, tokenContract: string): Promise<string> {
        const address = stacks.getAddress();
        if (!address) throw new Error('Wallet not connected');

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

    // Get STX balance
    async getBalance(address: string): Promise<number> {
        try {
            const apiUrl = (network as any).coreApiUrl || 'https://api.testnet.hiro.so';

            const response = await fetch(`${apiUrl}/extended/v1/address/${address}/balances`);
            const data = await response.json();
            return parseInt(data.stx.balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
            return 0;
        }
    },

    // Monitor transaction
    async getTransactionStatus(txId: string): Promise<any> {
        const apiUrl = (network as any).coreApiUrl || 'https://api.testnet.hiro.so';

        const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
        return response.json();
    },
};

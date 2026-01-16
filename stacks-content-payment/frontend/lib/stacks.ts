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

    // WBIP004 compliant wallet connection
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

            // Check for stored address
            const storedAddress = localStorage.getItem('wallet_address');
            if (storedAddress) {
                console.log('Using stored address:', storedAddress);
                return storedAddress;
            }

            // Use WBIP004 standard - check window.wbip_providers
            if (typeof window !== 'undefined') {
                const win = window as any;

                // Check if any wallets are registered
                const providers = win.wbip_providers || [];
                console.log('Available wallet providers:', providers);

                if (providers.length > 0) {
                    // Get the first available wallet provider
                    const walletProvider = providers[0];
                    console.log('Using wallet:', walletProvider.name);

                    // Get the actual provider object from window
                    const provider = win[walletProvider.id];

                    if (provider && provider.request) {
                        console.log('Calling stx_getAddresses...');

                        // Use the correct RPC method: stx_getAddresses
                        const response = await provider.request('stx_getAddresses', {
                            network: 'testnet'
                        });

                        console.log('Wallet response:', response);

                        // Response should have result.addresses array
                        if (response && response.result && response.result.addresses) {
                            const addresses = response.result.addresses;
                            // Find the STX address
                            const stxAddress = addresses.find((addr: any) => addr.symbol === 'STX');

                            if (stxAddress && stxAddress.address) {
                                const address = stxAddress.address;
                                console.log('Connected address:', address);
                                localStorage.setItem('wallet_address', address);
                                return address;
                            }
                        }
                    }
                }
            }

            // Fallback: manual input
            console.log('No wallet detected, using manual input');
            const address = prompt('Please enter your Stacks testnet address (starts with ST):');
            if (address && address.startsWith('ST')) {
                localStorage.setItem('wallet_address', address);
                console.log('Manually entered address:', address);
                return address;
            }

            throw new Error('Please install a Stacks wallet or enter a valid address');
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    },

    disconnectWallet: () => {
        const session = getUserSession();
        if (session) {
            session.signUserOut();
        }
        if (typeof window !== 'undefined') {
            localStorage.removeItem('wallet_address');
        }
    },

    isConnected: (): boolean => {
        const session = getUserSession();
        if (typeof window === 'undefined') return false;
        return (session?.isUserSignedIn() || false) || !!localStorage.getItem('wallet_address');
    },

    getAddress: (): string | null => {
        const session = getUserSession();
        if (session?.isUserSignedIn()) {
            const userData = session.loadUserData();
            return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
        }
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('wallet_address');
    },

    // Payment functions
    async payWithSTX(contentId: number, price: number): Promise<string> {
        const address = stacks.getAddress();
        if (!address) throw new Error('Wallet not connected');

        const contractAddress = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[0] || '';
        const contractName = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[1] || 'payment-handler';

        const txOptions = {
            contractAddress,
            contractName,
            functionName: 'pay-for-content-stx',
            functionArgs: [uintCV(contentId)],
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data: any) => {
                return data.txId;
            },
        };

        return 'tx-placeholder';
    },

    async payWithToken(contentId: number, tokenContract: string): Promise<string> {
        const address = stacks.getAddress();
        if (!address) throw new Error('Wallet not connected');

        const contractAddress = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[0] || '';
        const contractName = process.env.NEXT_PUBLIC_PAYMENT_HANDLER?.split('.')[1] || 'payment-handler';

        const txOptions = {
            contractAddress,
            contractName,
            functionName: 'pay-for-content-token',
            functionArgs: [uintCV(contentId), principalCV(tokenContract)],
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data: any) => {
                return data.txId;
            },
        };

        return 'tx-placeholder';
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

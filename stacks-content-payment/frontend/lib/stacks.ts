// Stacks blockchain utilities - Xverse wallet connection

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

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

const network: StacksNetwork = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
    ? STACKS_MAINNET
    : STACKS_TESTNET;

export const stacks = {
    userSession,

    // Xverse wallet connection
    connectWallet: async () => {
        try {
            console.log('Starting wallet connection...');

            // Check if already signed in
            if (userSession.isUserSignedIn()) {
                console.log('User already signed in');
                const userData = userSession.loadUserData();
                const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
                console.log('Existing address:', address);
                return address;
            }

            // Check if there's a pending sign in
            if (userSession.isSignInPending()) {
                console.log('Handling pending sign in...');
                await userSession.handlePendingSignIn();
                const userData = userSession.loadUserData();
                const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
                console.log('Address after pending sign in:', address);
                return address;
            }

            // Try Xverse wallet
            if (typeof window !== 'undefined') {
                const win = window as any;

                if (win.XverseProviders?.StacksProvider) {
                    console.log('Xverse wallet detected');
                    try {
                        const provider = win.XverseProviders.StacksProvider;

                        // Xverse uses getAddresses() method
                        const response = await provider.getAddresses();
                        console.log('Xverse response:', response);

                        if (response && response.addresses && response.addresses.length > 0) {
                            const address = response.addresses[0].address;
                            console.log('Connected via Xverse:', address);
                            localStorage.setItem('wallet_address', address);
                            return address;
                        }
                    } catch (error: any) {
                        console.error('Xverse connection error:', error);
                        // If user cancelled or error, throw a user-friendly message
                        if (error.message?.includes('User rejected')) {
                            throw new Error('Connection cancelled by user');
                        }
                    }
                }
            }
            throw new Error('Please install Xverse wallet extension');
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    },

    disconnectWallet: () => {
        userSession.signUserOut();
        localStorage.removeItem('wallet_address');
    },

    isConnected: (): boolean => {
        return userSession.isUserSignedIn() || !!localStorage.getItem('wallet_address');
    },

    getAddress: (): string | null => {
        if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
        }
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

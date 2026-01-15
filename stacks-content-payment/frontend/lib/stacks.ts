// Stacks blockchain utilities

import { connect, AppConfig, UserSession, disconnect } from '@stacks/connect';
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
    // Wallet connection using connect function
    connectWallet: async () => {
        try {
            // Check if already signed in
            if (userSession.isUserSignedIn()) {
                const userData = userSession.loadUserData();
                return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
            }

            // Check if there's a pending sign in (after redirect)
            if (userSession.isSignInPending()) {
                await userSession.handlePendingSignIn();
                const userData = userSession.loadUserData();
                return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
            }

            // Initiate new connection
            return new Promise<string>((resolve, reject) => {
                connect({
                    appDetails: {
                        name: 'Stacks Content Payment',
                        icon: typeof window !== 'undefined' ? window.location.origin + '/logo.png' : '/logo.png',
                    },
                    onFinish: (payload) => {
                        // The user has successfully authenticated
                        // We need to wait a bit for the session to be established
                        setTimeout(() => {
                            if (userSession.isUserSignedIn()) {
                                const userData = userSession.loadUserData();
                                const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
                                resolve(address);
                            } else {
                                reject(new Error('Authentication completed but session not established'));
                            }
                        }, 500);
                    },
                    onCancel: () => {
                        reject(new Error('User cancelled connection'));
                    },
                    userSession,
                });
            });
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    },

    disconnectWallet: () => {
        disconnect();
        userSession.signUserOut();
    },

    isConnected: (): boolean => {
        return userSession.isUserSignedIn();
    },

    getAddress: (): string | null => {
        if (!userSession.isUserSignedIn()) return null;
        const userData = userSession.loadUserData();
        return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
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

        // This would use @stacks/connect's openContractCall
        // For now, return a placeholder
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

        // This would use @stacks/connect's openContractCall
        return 'tx-placeholder';
    },

    // Get STX balance
    async getBalance(address: string): Promise<number> {
        try {
            const apiUrl = network.coreApiUrl || 'https://api.testnet.hiro.so';

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
        const apiUrl = network.coreApiUrl || 'https://api.testnet.hiro.so';

        const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
        return response.json();
    },
};

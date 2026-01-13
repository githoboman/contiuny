import {
    makeContractCall,
    broadcastTransaction,
    callReadOnlyFunction,
    AnchorMode,
    PostConditionMode,
    makeStandardSTXPostCondition,
    FungibleConditionCode,
    stringAsciiCV,
    stringUtf8CV,
    uintCV,
    principalCV,
    cvToValue,
    ClarityValue,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet, StacksNetwork } from '@stacks/network';

export class StacksService {
    private network: StacksNetwork;
    private contentRegistryAddress: string;
    private paymentHandlerAddress: string;
    private accessControlAddress: string;

    constructor(isMainnet: boolean = false) {
        this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
        this.contentRegistryAddress = process.env.CONTENT_REGISTRY_ADDRESS || '';
        this.paymentHandlerAddress = process.env.PAYMENT_HANDLER_ADDRESS || '';
        this.accessControlAddress = process.env.ACCESS_CONTROL_ADDRESS || '';
    }

    /**
     * Register new content on the blockchain
     */
    async registerContent(
        creatorKey: string,
        ipfsHash: string,
        price: number,
        metadataUri: string
    ) {
        const txOptions = {
            contractAddress: this.contentRegistryAddress.split('.')[0],
            contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
            functionName: 'register-content',
            functionArgs: [
                stringAsciiCV(ipfsHash),
                uintCV(price),
                stringUtf8CV(metadataUri),
            ],
            senderKey: creatorKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };

        const transaction = await makeContractCall(txOptions);
        return await broadcastTransaction(transaction, this.network);
    }

    /**
     * Process STX payment for content
     */
    async payForContent(
        userKey: string,
        userAddress: string,
        contentId: number,
        price: number
    ) {
        // Create post-condition to ensure exact payment
        const postCondition = makeStandardSTXPostCondition(
            userAddress,
            FungibleConditionCode.Equal,
            BigInt(price)
        );

        const txOptions = {
            contractAddress: this.paymentHandlerAddress.split('.')[0],
            contractName: this.paymentHandlerAddress.split('.')[1] || 'payment-handler',
            functionName: 'pay-for-content-stx',
            functionArgs: [uintCV(contentId)],
            senderKey: userKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditions: [postCondition],
        };

        const transaction = await makeContractCall(txOptions);
        return await broadcastTransaction(transaction, this.network);
    }

    /**
     * Check if user has access to content
     */
    async checkAccess(userAddress: string, contentId: number): Promise<boolean> {
        try {
            const result = await callReadOnlyFunction({
                contractAddress: this.paymentHandlerAddress.split('.')[0],
                contractName: this.paymentHandlerAddress.split('.')[1] || 'payment-handler',
                functionName: 'has-access',
                functionArgs: [principalCV(userAddress), uintCV(contentId)],
                network: this.network,
                senderAddress: userAddress,
            });

            return cvToValue(result) as boolean;
        } catch (error) {
            console.error('Error checking access:', error);
            return false;
        }
    }

    /**
     * Get content information
     */
    async getContentInfo(contentId: number, callerAddress: string) {
        try {
            const result = await callReadOnlyFunction({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-content-info',
                functionArgs: [uintCV(contentId)],
                network: this.network,
                senderAddress: callerAddress,
            });

            return cvToValue(result);
        } catch (error) {
            console.error('Error getting content info:', error);
            return null;
        }
    }

    /**
     * Get content price
     */
    async getContentPrice(contentId: number, callerAddress: string): Promise<number | null> {
        try {
            const result = await callReadOnlyFunction({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-content-price',
                functionArgs: [uintCV(contentId)],
                network: this.network,
                senderAddress: callerAddress,
            });

            const value = cvToValue(result);
            return value ? Number(value) : null;
        } catch (error) {
            console.error('Error getting content price:', error);
            return null;
        }
    }

    /**
     * Update content price (creator only)
     */
    async updatePrice(creatorKey: string, contentId: number, newPrice: number) {
        const txOptions = {
            contractAddress: this.contentRegistryAddress.split('.')[0],
            contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
            functionName: 'update-price',
            functionArgs: [uintCV(contentId), uintCV(newPrice)],
            senderKey: creatorKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };

        const transaction = await makeContractCall(txOptions);
        return await broadcastTransaction(transaction, this.network);
    }

    /**
     * Deactivate content (creator only)
     */
    async deactivateContent(creatorKey: string, contentId: number) {
        const txOptions = {
            contractAddress: this.contentRegistryAddress.split('.')[0],
            contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
            functionName: 'deactivate-content',
            functionArgs: [uintCV(contentId)],
            senderKey: creatorKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };

        const transaction = await makeContractCall(txOptions);
        return await broadcastTransaction(transaction, this.network);
    }

    /**
     * Get user access details
     */
    async getUserAccess(userAddress: string, contentId: number) {
        try {
            const result = await callReadOnlyFunction({
                contractAddress: this.paymentHandlerAddress.split('.')[0],
                contractName: this.paymentHandlerAddress.split('.')[1] || 'payment-handler',
                functionName: 'get-user-access',
                functionArgs: [principalCV(userAddress), uintCV(contentId)],
                network: this.network,
                senderAddress: userAddress,
            });

            return cvToValue(result);
        } catch (error) {
            console.error('Error getting user access:', error);
            return null;
        }
    }

    /**
     * Monitor transaction status
     */
    async getTransactionStatus(txId: string) {
        try {
            const apiUrl = this.network.isMainnet()
                ? 'https://api.mainnet.hiro.so'
                : 'https://api.testnet.hiro.so';

            const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
            return await response.json();
        } catch (error) {
            console.error('Error getting transaction status:', error);
            return null;
        }
    }

    /**
     * Get creator's content count
     */
    async getCreatorContentCount(creatorAddress: string, callerAddress: string): Promise<number> {
        try {
            const result = await callReadOnlyFunction({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-creator-content-count',
                functionArgs: [principalCV(creatorAddress)],
                network: this.network,
                senderAddress: callerAddress,
            });

            return Number(cvToValue(result));
        } catch (error) {
            console.error('Error getting creator content count:', error);
            return 0;
        }
    }
}

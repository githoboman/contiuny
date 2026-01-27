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
    ): Promise<{ contentId: number; txId: string }> {
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
        const result = await broadcastTransaction(transaction, this.network);

        // Extract txid from result
        const txId = typeof result === 'object' && 'txid' in result ? result.txid : '0x...';

        return {
            contentId: 1, // Placeholder - would need to parse from transaction result
            txId
        };
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
            // 1. Check contract state (Primary check)
            const result = await callReadOnlyFunction({
                contractAddress: this.paymentHandlerAddress.split('.')[0],
                contractName: this.paymentHandlerAddress.split('.')[1] || 'payment-handler',
                functionName: 'has-access',
                functionArgs: [principalCV(userAddress), uintCV(contentId)],
                network: this.network,
                senderAddress: userAddress,
            });

            const hasContractAccess = cvToValue(result) as boolean;
            if (hasContractAccess) return true;

            // 2. Fallback: Verify direct transfer history (Secondary check)
            // This handles cases where user paid via direct wallet transfer
            console.log(`Checking direct transfer history for User ${userAddress}, Content ${contentId}`);

            // Get content info to verify recipient and price
            const contentInfo = await this.getContentInfo(contentId);
            if (!contentInfo) {
                console.warn('Could not fetch content info for verification');
                return false;
            }

            // Parse content info (handling different possible structures from cvToValue)
            const creator = contentInfo.creator || contentInfo['creator'];
            const price = contentInfo.price || contentInfo['price']; // likely BigInt
            const priceNum = Number(price);

            if (!creator || !price) {
                console.warn('Invalid content info structure');
                return false;
            }

            return await this.verifyDirectTransfer(
                userAddress,
                creator,
                priceNum,
                `Payment for content #${contentId}`
            );
        } catch (error) {
            console.error('Error checking access:', error);
            return false;
        }
    }

    /**
     * Verify existence of a direct STX transfer in transaction history
     */
    async verifyDirectTransfer(
        sender: string,
        recipient: string,
        amountMicroStx: number,
        memo: string
    ): Promise<boolean> {
        try {
            const apiUrl = this.network.isMainnet()
                ? 'https://api.mainnet.hiro.so'
                : 'https://api.testnet.hiro.so';

            // Fetch recent transactions for the sender
            const response = await fetch(
                `${apiUrl}/extended/v1/address/${sender}/transactions?limit=50`
            );

            if (!response.ok) return false;

            const data = await response.json() as any;
            const transactions = data.results;

            // Look for matching transaction
            const match = transactions.find((tx: any) => {
                const isSuccess = tx.tx_status === 'success';
                const isTokenTransfer = tx.tx_type === 'token_transfer';

                if (!isSuccess || !isTokenTransfer) return false;

                const txRecipient = tx.token_transfer.recipient_address;
                const txAmount = Number(tx.token_transfer.amount);
                const txMemo = tx.token_transfer.memo; // Usually hex

                // Verify recipient and amount
                if (txRecipient !== recipient) return false;
                if (Math.abs(txAmount - amountMicroStx) > 100) return false; // Allow small dust error? usually exact

                // Verify memo (convert hex to string or check raw)
                // Memo in API is '0x...' hex string
                // expected memo is string 'Payment for content #ID'

                // Simple memo check: convert expected to hex
                const expectedMemoBuffer = Buffer.from(memo);
                const expectedMemoHex = '0x' + expectedMemoBuffer.toString('hex');

                // Allow exact match or if API returns raw string (rare)
                const memoMatch = txMemo === expectedMemoHex || txMemo === memo;

                return memoMatch;
            });

            if (match) {
                console.log(`✅ Direct transfer verified: ${match.tx_id}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error verifying direct transfer:', error);
            return false;
        }
    }

    /**
     * Get content information
     */
    async getContentInfo(contentId: number, callerAddress?: string) {
        try {
            const result = await callReadOnlyFunction({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-content-info',
                functionArgs: [uintCV(contentId)],
                network: this.network,
                senderAddress: callerAddress || this.contentRegistryAddress.split('.')[0],
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
    async updatePrice(creatorKey: string, contentId: number, newPrice: number): Promise<{ success: boolean; txId: string }> {
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
        const result = await broadcastTransaction(transaction, this.network);

        const txId = typeof result === 'object' && 'txid' in result ? result.txid : '0x...';

        return {
            success: true,
            txId
        };
    }

    /**
     * Deactivate content (creator only)
     */
    async deactivateContent(creatorKey: string, contentId: number): Promise<{ success: boolean; txId: string }> {
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
        const result = await broadcastTransaction(transaction, this.network);

        const txId = typeof result === 'object' && 'txid' in result ? result.txid : '0x...';

        return {
            success: true,
            txId
        };
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
    async getCreatorContentCount(creatorAddress: string, callerAddress?: string): Promise<number> {
        try {
            const result = await callReadOnlyFunction({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-creator-content-count',
                functionArgs: [principalCV(creatorAddress)],
                network: this.network,
                senderAddress: callerAddress || creatorAddress,
            });

            return Number(cvToValue(result));
        } catch (error) {
            console.error('Error getting creator content count:', error);
            return 0;
        }
    }

    // Additional methods needed by services

    async getTotalContentCount(): Promise<number> {
        return 0; // Placeholder - would need contract support
    }

    async getCreatorContentByIndex(creator: string, index: number): Promise<number | null> {
        return null; // Placeholder - would need contract support
    }

    async isContentActive(contentId: number): Promise<boolean> {
        const info = await this.getContentInfo(contentId);
        return info?.isActive || false;
    }

    async registerContentWithToken(
        creator: string,
        ipfsHash: string,
        priceStx: number,
        priceToken: number,
        tokenContract: string,
        metadataUri: string
    ): Promise<{ contentId: number; txId: string }> {
        return await this.registerContent(creator, ipfsHash, priceStx, metadataUri);
    }

    async updateContentPrice(creator: string, contentId: number, newPrice: number): Promise<{ success: boolean; txId: string }> {
        return await this.updatePrice(creator, contentId, newPrice);
    }

    async reactivateContent(creator: string, contentId: number): Promise<{ success: boolean; txId: string }> {
        // Placeholder - would call reactivate-content function
        return { success: true, txId: '0x...' };
    }

    async payForContentStx(user: string, contentId: number) {
        return { success: true, txId: '0x...', receiptId: 1 }; // Placeholder
    }

    async payForContentToken(user: string, contentId: number, tokenContract: string) {
        return { success: true, txId: '0x...', receiptId: 1 }; // Placeholder
    }

    async hasAccess(user: string, contentId: number): Promise<boolean> {
        return await this.checkAccess(user, contentId);
    }

    async verifyAccess(user: string, contentId: number): Promise<boolean> {
        return await this.checkAccess(user, contentId);
    }

    async getPaymentReceipt(receiptId: number) {
        return null; // Placeholder
    }

    async getTotalReceipts(): Promise<number> {
        return 0; // Placeholder
    }
}

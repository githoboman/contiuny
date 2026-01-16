"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StacksService = void 0;
const transactions_1 = require("@stacks/transactions");
const network_1 = require("@stacks/network");
class StacksService {
    constructor(isMainnet = false) {
        this.network = isMainnet ? new network_1.StacksMainnet() : new network_1.StacksTestnet();
        this.contentRegistryAddress = process.env.CONTENT_REGISTRY_ADDRESS || '';
        this.paymentHandlerAddress = process.env.PAYMENT_HANDLER_ADDRESS || '';
        this.accessControlAddress = process.env.ACCESS_CONTROL_ADDRESS || '';
    }
    /**
     * Register new content on the blockchain
     */
    async registerContent(creatorKey, ipfsHash, price, metadataUri) {
        const txOptions = {
            contractAddress: this.contentRegistryAddress.split('.')[0],
            contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
            functionName: 'register-content',
            functionArgs: [
                (0, transactions_1.stringAsciiCV)(ipfsHash),
                (0, transactions_1.uintCV)(price),
                (0, transactions_1.stringUtf8CV)(metadataUri),
            ],
            senderKey: creatorKey,
            network: this.network,
            anchorMode: transactions_1.AnchorMode.Any,
            postConditionMode: transactions_1.PostConditionMode.Deny,
        };
        const transaction = await (0, transactions_1.makeContractCall)(txOptions);
        const result = await (0, transactions_1.broadcastTransaction)(transaction, this.network);
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
    async payForContent(userKey, userAddress, contentId, price) {
        // Create post-condition to ensure exact payment
        const postCondition = (0, transactions_1.makeStandardSTXPostCondition)(userAddress, transactions_1.FungibleConditionCode.Equal, BigInt(price));
        const txOptions = {
            contractAddress: this.paymentHandlerAddress.split('.')[0],
            contractName: this.paymentHandlerAddress.split('.')[1] || 'payment-handler',
            functionName: 'pay-for-content-stx',
            functionArgs: [(0, transactions_1.uintCV)(contentId)],
            senderKey: userKey,
            network: this.network,
            anchorMode: transactions_1.AnchorMode.Any,
            postConditions: [postCondition],
        };
        const transaction = await (0, transactions_1.makeContractCall)(txOptions);
        return await (0, transactions_1.broadcastTransaction)(transaction, this.network);
    }
    /**
     * Check if user has access to content
     */
    async checkAccess(userAddress, contentId) {
        try {
            const result = await (0, transactions_1.callReadOnlyFunction)({
                contractAddress: this.paymentHandlerAddress.split('.')[0],
                contractName: this.paymentHandlerAddress.split('.')[1] || 'payment-handler',
                functionName: 'has-access',
                functionArgs: [(0, transactions_1.principalCV)(userAddress), (0, transactions_1.uintCV)(contentId)],
                network: this.network,
                senderAddress: userAddress,
            });
            return (0, transactions_1.cvToValue)(result);
        }
        catch (error) {
            console.error('Error checking access:', error);
            return false;
        }
    }
    /**
     * Get content information
     */
    async getContentInfo(contentId, callerAddress) {
        try {
            const result = await (0, transactions_1.callReadOnlyFunction)({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-content-info',
                functionArgs: [(0, transactions_1.uintCV)(contentId)],
                network: this.network,
                senderAddress: callerAddress || this.contentRegistryAddress.split('.')[0],
            });
            return (0, transactions_1.cvToValue)(result);
        }
        catch (error) {
            console.error('Error getting content info:', error);
            return null;
        }
    }
    /**
     * Get content price
     */
    async getContentPrice(contentId, callerAddress) {
        try {
            const result = await (0, transactions_1.callReadOnlyFunction)({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-content-price',
                functionArgs: [(0, transactions_1.uintCV)(contentId)],
                network: this.network,
                senderAddress: callerAddress,
            });
            const value = (0, transactions_1.cvToValue)(result);
            return value ? Number(value) : null;
        }
        catch (error) {
            console.error('Error getting content price:', error);
            return null;
        }
    }
    /**
     * Update content price (creator only)
     */
    async updatePrice(creatorKey, contentId, newPrice) {
        const txOptions = {
            contractAddress: this.contentRegistryAddress.split('.')[0],
            contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
            functionName: 'update-price',
            functionArgs: [(0, transactions_1.uintCV)(contentId), (0, transactions_1.uintCV)(newPrice)],
            senderKey: creatorKey,
            network: this.network,
            anchorMode: transactions_1.AnchorMode.Any,
            postConditionMode: transactions_1.PostConditionMode.Deny,
        };
        const transaction = await (0, transactions_1.makeContractCall)(txOptions);
        const result = await (0, transactions_1.broadcastTransaction)(transaction, this.network);
        const txId = typeof result === 'object' && 'txid' in result ? result.txid : '0x...';
        return {
            success: true,
            txId
        };
    }
    /**
     * Deactivate content (creator only)
     */
    async deactivateContent(creatorKey, contentId) {
        const txOptions = {
            contractAddress: this.contentRegistryAddress.split('.')[0],
            contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
            functionName: 'deactivate-content',
            functionArgs: [(0, transactions_1.uintCV)(contentId)],
            senderKey: creatorKey,
            network: this.network,
            anchorMode: transactions_1.AnchorMode.Any,
            postConditionMode: transactions_1.PostConditionMode.Deny,
        };
        const transaction = await (0, transactions_1.makeContractCall)(txOptions);
        const result = await (0, transactions_1.broadcastTransaction)(transaction, this.network);
        const txId = typeof result === 'object' && 'txid' in result ? result.txid : '0x...';
        return {
            success: true,
            txId
        };
    }
    /**
     * Get user access details
     */
    async getUserAccess(userAddress, contentId) {
        try {
            const result = await (0, transactions_1.callReadOnlyFunction)({
                contractAddress: this.paymentHandlerAddress.split('.')[0],
                contractName: this.paymentHandlerAddress.split('.')[1] || 'payment-handler',
                functionName: 'get-user-access',
                functionArgs: [(0, transactions_1.principalCV)(userAddress), (0, transactions_1.uintCV)(contentId)],
                network: this.network,
                senderAddress: userAddress,
            });
            return (0, transactions_1.cvToValue)(result);
        }
        catch (error) {
            console.error('Error getting user access:', error);
            return null;
        }
    }
    /**
     * Monitor transaction status
     */
    async getTransactionStatus(txId) {
        try {
            const apiUrl = this.network.isMainnet()
                ? 'https://api.mainnet.hiro.so'
                : 'https://api.testnet.hiro.so';
            const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
            return await response.json();
        }
        catch (error) {
            console.error('Error getting transaction status:', error);
            return null;
        }
    }
    /**
     * Get creator's content count
     */
    async getCreatorContentCount(creatorAddress, callerAddress) {
        try {
            const result = await (0, transactions_1.callReadOnlyFunction)({
                contractAddress: this.contentRegistryAddress.split('.')[0],
                contractName: this.contentRegistryAddress.split('.')[1] || 'content-registry',
                functionName: 'get-creator-content-count',
                functionArgs: [(0, transactions_1.principalCV)(creatorAddress)],
                network: this.network,
                senderAddress: callerAddress || creatorAddress,
            });
            return Number((0, transactions_1.cvToValue)(result));
        }
        catch (error) {
            console.error('Error getting creator content count:', error);
            return 0;
        }
    }
    // Additional methods needed by services
    async getTotalContentCount() {
        return 0; // Placeholder - would need contract support
    }
    async getCreatorContentByIndex(creator, index) {
        return null; // Placeholder - would need contract support
    }
    async isContentActive(contentId) {
        const info = await this.getContentInfo(contentId);
        return info?.isActive || false;
    }
    async registerContentWithToken(creator, ipfsHash, priceStx, priceToken, tokenContract, metadataUri) {
        return await this.registerContent(creator, ipfsHash, priceStx, metadataUri);
    }
    async updateContentPrice(creator, contentId, newPrice) {
        return await this.updatePrice(creator, contentId, newPrice);
    }
    async reactivateContent(creator, contentId) {
        // Placeholder - would call reactivate-content function
        return { success: true, txId: '0x...' };
    }
    async payForContentStx(user, contentId) {
        return { success: true, txId: '0x...', receiptId: 1 }; // Placeholder
    }
    async payForContentToken(user, contentId, tokenContract) {
        return { success: true, txId: '0x...', receiptId: 1 }; // Placeholder
    }
    async hasAccess(user, contentId) {
        return await this.checkAccess(user, contentId);
    }
    async verifyAccess(user, contentId) {
        return await this.checkAccess(user, contentId);
    }
    async getPaymentReceipt(receiptId) {
        return null; // Placeholder
    }
    async getTotalReceipts() {
        return 0; // Placeholder
    }
}
exports.StacksService = StacksService;
//# sourceMappingURL=stacksService.js.map
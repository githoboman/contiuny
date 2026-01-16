"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.validateIpfsHash = exports.validateTokenPaymentRequest = exports.validatePaymentRequest = exports.validateContentRegistration = void 0;
/**
 * Validation middleware for content registration
 */
const validateContentRegistration = (req, res, next) => {
    const { creator, ipfsHash, priceStx, metadataUri } = req.body;
    const errors = [];
    if (!creator || typeof creator !== 'string') {
        errors.push('creator must be a valid string');
    }
    if (!ipfsHash || typeof ipfsHash !== 'string') {
        errors.push('ipfsHash must be a valid string');
    }
    if (!priceStx || typeof priceStx !== 'number' || priceStx <= 0) {
        errors.push('priceStx must be a positive number');
    }
    if (!metadataUri || typeof metadataUri !== 'string') {
        errors.push('metadataUri must be a valid string');
    }
    // Validate Stacks address format (basic)
    if (creator && !isValidStacksAddress(creator)) {
        errors.push('creator must be a valid Stacks address');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }
    next();
};
exports.validateContentRegistration = validateContentRegistration;
/**
 * Validation middleware for payment requests
 */
const validatePaymentRequest = (req, res, next) => {
    const { user, contentId } = req.body;
    const errors = [];
    if (!user || typeof user !== 'string') {
        errors.push('user must be a valid string');
    }
    if (!contentId || typeof contentId !== 'number' || contentId <= 0) {
        errors.push('contentId must be a positive number');
    }
    // Validate Stacks address format
    if (user && !isValidStacksAddress(user)) {
        errors.push('user must be a valid Stacks address');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }
    next();
};
exports.validatePaymentRequest = validatePaymentRequest;
/**
 * Validation middleware for token payment requests
 */
const validateTokenPaymentRequest = (req, res, next) => {
    const { user, contentId, tokenContract } = req.body;
    const errors = [];
    if (!user || typeof user !== 'string') {
        errors.push('user must be a valid string');
    }
    if (!contentId || typeof contentId !== 'number' || contentId <= 0) {
        errors.push('contentId must be a positive number');
    }
    if (!tokenContract || typeof tokenContract !== 'string') {
        errors.push('tokenContract must be a valid string');
    }
    // Validate Stacks addresses
    if (user && !isValidStacksAddress(user)) {
        errors.push('user must be a valid Stacks address');
    }
    if (tokenContract && !isValidContractId(tokenContract)) {
        errors.push('tokenContract must be a valid contract identifier');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }
    next();
};
exports.validateTokenPaymentRequest = validateTokenPaymentRequest;
/**
 * Validate Stacks address format
 */
function isValidStacksAddress(address) {
    // Mainnet addresses start with SP, testnet with ST
    // Followed by 39 alphanumeric characters
    const stacksAddressRegex = /^(SP|ST)[0-9A-Z]{39}$/;
    return stacksAddressRegex.test(address);
}
/**
 * Validate Stacks contract identifier format
 */
function isValidContractId(contractId) {
    // Format: ADDRESS.CONTRACT_NAME
    const parts = contractId.split('.');
    if (parts.length !== 2)
        return false;
    const [address, contractName] = parts;
    // Validate address part
    if (!isValidStacksAddress(address))
        return false;
    // Validate contract name (alphanumeric, hyphens, underscores)
    const contractNameRegex = /^[a-z0-9-_]+$/;
    return contractNameRegex.test(contractName);
}
/**
 * Validate IPFS hash format
 */
const validateIpfsHash = (hash) => {
    // Basic validation for IPFS CIDv0 (Qm...)
    const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    return ipfsHashRegex.test(hash);
};
exports.validateIpfsHash = validateIpfsHash;
/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
    // Remove any potentially harmful characters
    return input.replace(/[<>]/g, '');
};
exports.sanitizeInput = sanitizeInput;
//# sourceMappingURL=validation.middleware.js.map
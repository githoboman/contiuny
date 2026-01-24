import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for content registration
 */
export const validateContentRegistration = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { creator, ipfsHash, priceStx, priceToken, tokenContract, metadataUri } = req.body;

    const errors: string[] = [];

    // Validate creator
    if (!creator || typeof creator !== 'string') {
        errors.push('creator must be a valid string');
    } else if (!isValidStacksAddress(creator)) {
        errors.push('creator must be a valid Stacks address');
    }

    // Validate IPFS hash
    if (!ipfsHash || typeof ipfsHash !== 'string') {
        errors.push('ipfsHash must be a valid string');
    } else if (!validateIpfsHash(ipfsHash)) {
        errors.push('ipfsHash must be a valid IPFS hash (starts with Qm or bafy)');
    }

    // Validate STX price with range checks
    if (!priceStx || typeof priceStx !== 'number' || priceStx <= 0) {
        errors.push('priceStx must be a positive number');
    } else {
        // Business logic: Set reasonable price limits (in micro-STX)
        const MIN_PRICE_MICRO_STX = 100_000; // 0.1 STX minimum
        const MAX_PRICE_MICRO_STX = 1_000_000_000_000; // 1,000,000 STX maximum

        if (priceStx < MIN_PRICE_MICRO_STX) {
            errors.push(`priceStx must be at least ${MIN_PRICE_MICRO_STX / 1_000_000} STX (${MIN_PRICE_MICRO_STX} micro-STX)`);
        }

        if (priceStx > MAX_PRICE_MICRO_STX) {
            errors.push(`priceStx cannot exceed ${MAX_PRICE_MICRO_STX / 1_000_000} STX (${MAX_PRICE_MICRO_STX} micro-STX)`);
        }
    }

    // Validate metadata URI
    if (!metadataUri || typeof metadataUri !== 'string') {
        errors.push('metadataUri must be a valid string');
    } else {
        try {
            new URL(metadataUri);
        } catch {
            errors.push('metadataUri must be a valid URL');
        }
    }

    // Validate token pricing if provided (both must be present and valid)
    if (priceToken && tokenContract) {
        // Validate token price
        if (typeof priceToken !== 'number' || priceToken <= 0) {
            errors.push('priceToken must be a positive number');
        } else {
            // Token price limits (assuming 6 decimals like USDC)
            const MIN_TOKEN_PRICE = 10_000; // $0.01 minimum
            const MAX_TOKEN_PRICE = 1_000_000_000_000; // $1,000,000 maximum

            if (priceToken < MIN_TOKEN_PRICE) {
                errors.push(`priceToken must be at least $${MIN_TOKEN_PRICE / 1_000_000}`);
            }

            if (priceToken > MAX_TOKEN_PRICE) {
                errors.push(`priceToken cannot exceed $${MAX_TOKEN_PRICE / 1_000_000}`);
            }
        }

        // Validate token contract
        if (typeof tokenContract !== 'string') {
            errors.push('tokenContract must be a valid string');
        } else if (!isValidContractId(tokenContract)) {
            errors.push('tokenContract must be a valid contract identifier (address.contract-name)');
        }
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

/**
 * Validation middleware for payment requests
 */
export const validatePaymentRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user, contentId } = req.body;

    const errors: string[] = [];

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

/**
 * Validation middleware for token payment requests
 */
export const validateTokenPaymentRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user, contentId, tokenContract } = req.body;

    const errors: string[] = [];

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

/**
 * Validate Stacks address format
 */
function isValidStacksAddress(address: string): boolean {
    // Mainnet addresses start with SP, testnet with ST
    // Followed by 38-39 alphanumeric characters (some testnet addresses are 40 chars total)
    const stacksAddressRegex = /^(SP|ST)[0-9A-Z]{38,39}$/;
    return stacksAddressRegex.test(address);
}

/**
 * Validate Stacks contract identifier format
 */
function isValidContractId(contractId: string): boolean {
    // Format: ADDRESS.CONTRACT_NAME
    const parts = contractId.split('.');
    if (parts.length !== 2) return false;

    const [address, contractName] = parts;

    // Validate address part
    if (!isValidStacksAddress(address)) return false;

    // Validate contract name (alphanumeric, hyphens, underscores)
    const contractNameRegex = /^[a-z0-9-_]+$/;
    return contractNameRegex.test(contractName);
}

/**
 * Validate IPFS hash format
 */
export const validateIpfsHash = (hash: string): boolean => {
    // CIDv0 format (Qm...)
    const ipfsHashV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    // CIDv1 format (bafy...)
    const ipfsHashV1Regex = /^bafy[a-z0-9]{50,}$/;

    return ipfsHashV0Regex.test(hash) || ipfsHashV1Regex.test(hash);
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
    // Remove any potentially harmful characters
    return input.replace(/[<>]/g, '');
};

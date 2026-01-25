const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com'; // Using public node for script

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';

// Guessing function signature. 
// Etherscan source had "domains" mapping? Or "isDomainSupported"?
// Common CCTP interface: "isRemoteDomain(uint32)" or "supportedDomains".
// Let's try likely view functions.

const ABI = [
    {
        name: 'isDestinationDomainSupported',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'uint32', name: 'domain' }],
        outputs: [{ type: 'bool' }]
    },
    {
        name: 'remoteTokenMessengers', // Standard CCTP
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'uint32', name: 'domain' }],
        outputs: [{ type: 'bytes32' }]
    }
];

const CANDIDATES = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    10003, // Documented Stacks
    10000,
    2147483647
];

async function scanDefaults() {
    console.log(`Scanning domains on ${XRESERVE_ADDRESS}...`);

    for (const domain of CANDIDATES) {
        try {
            const supported = await client.readContract({
                address: XRESERVE_ADDRESS,
                abi: ABI,
                functionName: 'isDestinationDomainSupported',
                args: [domain]
            });
            console.log(`Domain ${domain}: Supported? ${supported}`);
        } catch (e) {
            // Function might not exist or revert
            // Try alternative: remoteTokenMessengers
            try {
                const messenger = await client.readContract({
                    address: XRESERVE_ADDRESS,
                    abi: ABI,
                    functionName: 'remoteTokenMessengers',
                    args: [domain]
                });
                const exists = messenger !== '0x0000000000000000000000000000000000000000000000000000000000000000';
                console.log(`Domain ${domain}: Messenger? ${exists} (${messenger})`);
            } catch (inner) {
                // console.log(`Domain ${domain} check failed`);
            }
        }
    }
}

scanDefaults();

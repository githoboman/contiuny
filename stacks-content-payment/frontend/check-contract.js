const { createPublicClient, http, parseAbi } = require('viem');
const { sepolia } = require('viem/chains');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const XRESERVE = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const CCTP_MESSENGER = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb66855';

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

async function main() {
    console.log('Checking XRESERVE bytecode...');
    const code = await client.getBytecode({ address: XRESERVE });
    console.log('Code exists:', !!code && code.length > 2);
    if (!code || code.length <= 2) {
        console.error('❌ XRESERVE is NOT a contract!');
    }

    // Try simulate CCTP just in case
    // depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)
    // Domain 0 (Ethereum) just to test? No, destination needs to be valid. 
    // If I use 0 it fails locally (same chain).
    // Try domain 1 (Avalanche).
}

main();

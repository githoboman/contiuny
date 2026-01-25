const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

// Use reliable RPC if possible, or fallback list
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const CCTP_V1 = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5';
const CCTP_V2 = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275';
const STACKS_DOMAIN = 10003; // From docs

const ABI = [
    {
        name: 'remoteTokenMessengers',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'uint32', name: 'domain' }],
        outputs: [{ type: 'bytes32' }]
    },
    // V2 might use 'getRemoteTokenMessenger' or similar? Standard is remoteTokenMessengers mapping.
    // Also checking 'domains'
];

async function check(contract, name) {
    console.log(`Checking ${name} (${contract}) for Domain ${STACKS_DOMAIN}...`);
    try {
        const messenger = await client.readContract({
            address: contract,
            abi: ABI,
            functionName: 'remoteTokenMessengers',
            args: [STACKS_DOMAIN]
        });
        const valid = messenger !== '0x0000000000000000000000000000000000000000000000000000000000000000';
        console.log(`> Domain ${STACKS_DOMAIN} Valid? ${valid} (Messenger: ${messenger})`);
        return valid;
    } catch (e) {
        console.log(`> Read failed on ${name}:`, e.shortMessage || e.message);
        return false;
    }
}

async function run() {
    await check(CCTP_V1, 'CCTP V1');
    await check(CCTP_V2, 'CCTP V2');
}

run();

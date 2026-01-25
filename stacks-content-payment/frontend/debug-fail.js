const { createPublicClient, http, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const SENDER = '0xF14bc9656c57D265C53dA70f9b80453f759c1D27';
const ADDRESS_HASH = '2242e7aaf77f83a98a21936bb45ebb9863a1e311';

// Try standard parameters
const DOMAIN = 10003;
const RECIPIENT = '0x' + ADDRESS_HASH.padEnd(64, '0'); // Right Padded
const AMOUNT = 1000000n; // 1 USDC

const USDC_ABI = [
    {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
    }
];

const XRESERVE_ABI = [{
    name: 'depositToRemote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
        { name: 'remoteDomain', type: 'uint32' },
        { name: 'recipient', type: 'bytes32' },
        { name: 'amount', type: 'uint256' }
    ],
    outputs: []
}];

async function debug() {
    console.log('--- Debugging xReserve Failure ---');
    console.log(`Sender: ${SENDER}`);
    console.log(`Spender (xReserve): ${XRESERVE_ADDRESS}`);

    // 1. Check if Paused
    try {
        const isPaused = await client.readContract({
            address: XRESERVE_ADDRESS,
            abi: [{ name: 'paused', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] }],
            functionName: 'paused',
        });
        console.log(`Contract Paused: ${isPaused}`);
        if (isPaused) {
            console.error('❌ CONTRACT IS PAUSED! Bridge is currently disabled.');
            return;
        }
    } catch (err) {
        console.log('Could not check paused state (might not exist):', err.shortMessage || err.message);
    }

    // 2. Check Allowance
    try {
        const allowance = await client.readContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: 'allowance',
            args: [SENDER, XRESERVE_ADDRESS]
        });
        console.log(`Allowance: ${allowance.toString()} (Needs ${AMOUNT})`);

        if (allowance < AMOUNT) {
            console.error('❌ INSUFFICIENT ALLOWANCE! That explains why it reverts.');
            return;
        }
    } catch (err) {
        console.error('Failed to check allowance:', err.message);
        return;
    }

    // 2. Simulate
    console.log('Simulating depositToRemote...');
    try {
        await client.simulateContract({
            address: XRESERVE_ADDRESS,
            abi: XRESERVE_ABI,
            functionName: 'depositToRemote',
            args: [DOMAIN, RECIPIENT, AMOUNT],
            account: SENDER
        });
        console.log('✅ Simulation SUCCESS!');
    } catch (err) {
        console.error('❌ Simulation FAILED');
        console.error('Reason:', err.shortMessage || err.message);
        // Sometimes detail is in data
        if (err.data) console.error('Error Data:', err.data);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

debug();

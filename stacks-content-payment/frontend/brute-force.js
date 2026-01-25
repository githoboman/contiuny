const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

// Use PublicNode
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const SENDER = '0xF14bc9656c57D265C53dA70f9b80453f759c1D27';
const ADDRESS_HASH = '2242e7aaf77f83a98a21936bb45ebb9863a1e311';

// Permutations
const DOMAINS = [10003, 0, 1, 2, 3, 4, 5, 10001];
const PADDINGS = [
    { name: 'RIGHT', hex: '0x' + ADDRESS_HASH.padEnd(64, '0') },
    { name: 'LEFT', hex: '0x' + ADDRESS_HASH.padStart(64, '0') }
];

async function check(domain, padding) {
    try {
        await client.simulateContract({
            address: XRESERVE_ADDRESS,
            abi: [{
                name: 'depositToRemote',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [
                    { name: 'remoteDomain', type: 'uint32' },
                    { name: 'recipient', type: 'bytes32' },
                    { name: 'amount', type: 'uint256' }
                ],
                outputs: []
            }],
            functionName: 'depositToRemote',
            args: [domain, padding.hex, 1n], // Verify 1 Wei (minimal amount) to bypass checks? Or 1000000n
            account: SENDER
        });
        console.log(`✅ SUCCESS: Domain ${domain}, Padding ${padding.name}`);
        return true;
    } catch (err) {
        // console.log(`❌ FAILED: Domain ${domain}, Padding ${padding.name} - ${err.shortMessage || err.message.slice(0, 50)}`);
        return false;
    }
}

async function run() {
    console.log('Starting brute force simulation...');
    let found = false;

    for (const d of DOMAINS) {
        for (const p of PADDINGS) {
            const success = await check(d, p);
            if (success) found = true;
        }
    }

    if (!found) console.log('All permutations failed.');
}

run();

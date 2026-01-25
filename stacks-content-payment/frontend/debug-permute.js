const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const SENDER = '0xF14bc9656c57D265C53dA70f9b80453f759c1D27';
// Raw hash
const HASH = '2242e7aaf77f83a98a21936bb45ebb9863a1e311';
// Version + Hash (0x1a + hash)
const VERSION_HASH = '1a' + HASH;

const AMOUNT = 10000n; // Micro amount

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

const CASES = [
    { name: 'RIGHT_PAD_HASH', hex: '0x' + HASH.padEnd(64, '0') },
    { name: 'LEFT_PAD_HASH', hex: '0x' + HASH.padStart(64, '0') },
    { name: 'RIGHT_PAD_VERSION', hex: '0x' + VERSION_HASH.padEnd(64, '0') },
    { name: 'LEFT_PAD_VERSION', hex: '0x' + VERSION_HASH.padStart(64, '0') },
    { name: 'DOMAIN_0_RIGHT', hex: '0x' + HASH.padEnd(64, '0'), domain: 0 },
    { name: 'DOMAIN_10003_RIGHT', hex: '0x' + HASH.padEnd(64, '0'), domain: 10003 },
];

async function check(c) {
    const domain = c.domain ?? 10003;
    try {
        await client.simulateContract({
            address: XRESERVE_ADDRESS,
            abi: XRESERVE_ABI,
            functionName: 'depositToRemote',
            args: [domain, c.hex, AMOUNT],
            account: SENDER
        });
        console.log(`✅ SUCCESS: ${c.name} (Domain ${domain})`);
        return true;
    } catch (err) {
        // console.log(`❌ FAIL: ${c.name}`);
        return false;
    }
}

async function run() {
    console.log('Testing permutations...');
    let passed = 0;
    for (const c of CASES) {
        if (await check(c)) passed++;
    }
    if (passed === 0) console.log('All failed.');
}

run();

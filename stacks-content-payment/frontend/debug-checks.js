const { createPublicClient, http, parseAbi } = require('viem');
const { sepolia } = require('viem/chains');

// Config
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442'; // The bridge contract
const SENDER = '0xF14bc9656c57D265C53dA70f9b80453f759c1D27'; // User's address

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const ABI = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address, address) view returns (uint256)',
    'function depositToRemote(uint32 remoteDomain, bytes32 recipient, uint256 amount)'
]);

async function check() {
    console.log('--- Debug Checks ---');
    console.log('Sender:', SENDER);
    console.log('Spender (Bridge):', XRESERVE_ADDRESS);

    // 1. Check Balance
    try {
        const balance = await client.readContract({
            address: USDC_ADDRESS,
            abi: ABI,
            functionName: 'balanceOf',
            args: [SENDER]
        });
        console.log('USDC Balance:', balance.toString(), balance > 0n ? '✅' : '❌');
    } catch (e) { console.error('Balance check failed:', e.message); }

    // 2. Check Allowance
    try {
        const allowance = await client.readContract({
            address: USDC_ADDRESS,
            abi: ABI,
            functionName: 'allowance',
            args: [SENDER, XRESERVE_ADDRESS]
        });
        console.log('Allowance:', allowance.toString(), allowance >= 1000000n ? '✅' : '❌');
    } catch (e) { console.error('Allowance check failed:', e.message); }

    // 3. Try to Simulate (if balance/allowance is OK)
    try {
        console.log('Simulating depositToRemote...');
        await client.simulateContract({
            address: XRESERVE_ADDRESS,
            abi: ABI,
            functionName: 'depositToRemote',
            args: [10003, '0x00000000000000000000001a2242e7aaf77f83a98a21936bb45ebb9863a1e311', 1000000n],
            account: SENDER
        });
        console.log('✅ Simulation SUCCESS');
    } catch (e) {
        console.log('❌ Simulation FAILED');
        console.log('Reason:', e.shortMessage || e.message);
    }
}

check();

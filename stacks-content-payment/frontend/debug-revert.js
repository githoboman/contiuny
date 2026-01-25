const { createPublicClient, http, encodeFunctionData, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const SENDER = '0xF14bc9656c57D265C53dA70f9b80453f759c1D27'; // Your address

// Params that failed (Right Padded)
const DOMAIN = 10003;
const RECIPIENT = '0x2242e7aaf77f83a98a21936bb45ebb9863a1e311000000000000000000000000';
const AMOUNT = 2000000n; // 2 USDC

async function debug() {
    console.log('Simulating depositToRemote...');
    try {
        const { result } = await client.simulateContract({
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
            args: [DOMAIN, RECIPIENT, AMOUNT],
            account: SENDER
        });
        console.log('Simulation SUCCESS:', result);
    } catch (err) {
        console.log('Simulation FAILED:');
        console.log(err.message);
        if (err.data) console.log('Error Data:', err.data);
    }
}

debug();

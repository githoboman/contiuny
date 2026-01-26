import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

const ABI = parseAbi([
    'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) external returns (uint64 _nonce)'
]);

async function main() {
    const client = createPublicClient({
        chain: sepolia,
        transport: http()
    });

    const args = [
        1000000n, // 1 USDC
        10003, // destinationDomain
        '0x00000000000000000000001a2242e7aaf77f83a98a21936bb45ebb9863a1e311', // mintRecipient
        USDC_ADDRESS
    ];

    const sender = '0xF14bc9656c57D265C53dA70f9b80453f759c1D27'; // User's address from log

    console.log('Simulating call...');
    try {
        const { request } = await client.simulateContract({
            address: XRESERVE_ADDRESS,
            abi: ABI,
            functionName: 'depositForBurn',
            args: args,
            account: sender,
        });
        console.log('Simulation success:', request);
    } catch (err: any) {
        console.error('Simulation failed!');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
        if (err.data) console.error('Data:', err.data);
    }
}

main();

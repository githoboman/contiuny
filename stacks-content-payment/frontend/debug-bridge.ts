import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

const ABI = parseAbi([
    'function depositToRemote(uint256 value, uint32 remoteDomain, bytes32 remoteRecipient, address localToken, uint256 maxFee, bytes calldata hookData)'
]);

async function main() {
    const client = createPublicClient({
        chain: sepolia,
        transport: http()
    });

    const sender = '0xF14bc9656c57D265C53dA70f9b80453f759c1D27';

    console.log('Simulating call...');
    try {
        const { request } = await client.simulateContract({
            address: XRESERVE_ADDRESS,
            abi: ABI,
            functionName: 'depositToRemote',
            args: [
                BigInt(1000000), // value
                10003,    // remoteDomain
                '0x00000000000000000000001a2242e7aaf77f83a98a21936bb45ebb9863a1e311', // remoteRecipient
                USDC_ADDRESS, // localToken
                BigInt(0),       // maxFee
                '0x'      // hookData
            ],
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

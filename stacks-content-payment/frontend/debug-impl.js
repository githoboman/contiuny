const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

const PROXY_ADDRESS = '0xed3bafc0d71398c361e5758f91e48f53739348b0'; // The implementation we found

// ERC1967 Implementation Slot
const SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

async function getImpl() {
    console.log('Fetching implementation address...');
    try {
        const impl = await client.getStorageAt({
            address: PROXY_ADDRESS,
            slot: SLOT
        });
        console.log(`Implementation Address: ${impl}`);
        // Remove padding to get standard address
        const cleanAddress = '0x' + impl.slice(26);
        console.log(`Formatted: ${cleanAddress}`);
    } catch (err) {
        console.error('Failed to get storage:', err.message);
    }
}

getImpl();

import { remoteRecipientCoder, bytes32FromBytes } from './frontend/lib/bridge/usdc-helpers';

// The address from the logs (last 20 bytes of the 32 byte string)
// 00000000000000000000001A2242E7AAF77F83A98A21936BB45EBB9863A1E311
// Version byte seems to be 1A (26)

const rawLog = "00000000000000000000001A2242E7AAF77F83A98A21936BB45EBB9863A1E311";

// Let's decode this using our coder reverse logic if possible, or just encode a sample address.
// The user didn't provide their Stacks address in the text, but the guide used "ST1F1M4YP67NV360FBYR28V7C599AC46F8C4635SH".
// Let's try to encode a dummy testnet address and see what the structure looks like.

const TEST_ADDR = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
// ST1PQ... is the standard devnet/testnet address often used.

console.log("Test logic...");
try {
    const encoded = bytes32FromBytes(remoteRecipientCoder.encode(TEST_ADDR));
    console.log(`Address: ${TEST_ADDR}`);
    console.log(`Encoded: ${encoded}`);
} catch (e) {
    console.error(e);
}

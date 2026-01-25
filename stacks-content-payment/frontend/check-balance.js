const { StacksTestnet } = require('@stacks/network');
const { callReadOnlyFunction, cvToValue, standardPrincipalCV } = require('@stacks/transactions');

const NETWORK = new StacksTestnet();
const USER_ADDRESS = 'ST9NSDHK5969YF6WJ2MRCVVAVTDENWBNTFJRVZ3E'; // From logs
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'usdcx';

async function checkBalance() {
    console.log(`Checking balance for ${USER_ADDRESS}...`);
    try {
        const result = await callReadOnlyFunction({
            network: NETWORK,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-balance',
            functionArgs: [standardPrincipalCV(USER_ADDRESS)],
            senderAddress: USER_ADDRESS
        });

        const balance = cvToValue(result);
        console.log(`Balance: ${balance.value} (raw)`);
    } catch (e) {
        console.error('Check failed:', e.message);
    }
}

checkBalance();

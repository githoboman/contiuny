const solc = require('solc');
const fs = require('fs');
const path = require('path');

const contractPath = path.resolve(__dirname, '../contracts/SimpleBridge.sol');
try {
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'SimpleBridge.sol': {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    console.log('Compiling...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        let hasError = false;
        output.errors.forEach(err => {
            console.error(err.formattedMessage);
            if (err.severity === 'error') hasError = true;
        });
        if (hasError) process.exit(1);
    }

    const contract = output.contracts['SimpleBridge.sol']['SimpleBridgeVault'];
    if (!contract) {
        console.error('Contract not found in output');
        process.exit(1);
    }

    const artifact = {
        abi: contract.abi,
        bytecode: '0x' + contract.evm.bytecode.object
    };

    const outPath = path.resolve(__dirname, 'lib/contracts/SimpleBridgeVault.json');
    // Ensure dir exists
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));
    console.log('Compilation success! Saved to', outPath);

} catch (e) {
    console.error('Compile failed:', e);
}

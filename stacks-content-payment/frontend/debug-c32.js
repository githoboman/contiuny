const { c32addressDecode } = require('c32check');

const address = 'STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM';

try {
    const decoded = c32addressDecode(address);
    // decoded is usually [version, hash160]
    const version = decoded[0];
    const hash160 = decoded[1];

    console.log('Version:', version);
    console.log('Hash160 type:', typeof hash160);
    console.log('Hash160 length:', hash160.length);
    console.log('Hash160 bytes:', Array.from(hash160));

    if (hash160 instanceof Uint8Array) {
        const hex = Buffer.from(hash160).toString('hex');
        console.log('Hash160 hex:', hex);
    } else {
        // If it is a string (some versions behave differently)
        console.log('Hash160 value:', hash160);
    }

} catch (e) {
    console.error(e);
}

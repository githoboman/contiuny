const hash160Hex = "2242e7aaf77f83a98a21936bb45ebb9863a1e311";
console.log("Original Hex:", hash160Hex);

// Fix login: ensure it's padded to 32 bytes
const padded = hash160Hex.padStart(64, '0');
console.log("Padded Hex:", padded);
console.log("Padded Length:", padded.length);

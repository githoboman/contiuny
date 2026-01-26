export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as any,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptFile(file: File, password: string): Promise<Blob> {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const fileBuffer = await file.arrayBuffer();
    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        fileBuffer
    );

    // Combine Salt + IV + Encrypted Data
    // Layout: [Salt (16 bytes)] [IV (12 bytes)] [Encrypted Data (...)]
    const combinedBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
    combinedBuffer.set(salt, 0);
    combinedBuffer.set(iv, salt.byteLength);
    combinedBuffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

    return new Blob([combinedBuffer], { type: 'application/octet-stream' });
}

export async function decryptFile(encryptedBlob: Blob, password: string): Promise<ArrayBuffer> {
    const buffer = await encryptedBlob.arrayBuffer();
    const data = new Uint8Array(buffer);

    // Extract Salt and IV
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28); // 16 + 12 = 28
    const encryptedContent = data.slice(28);

    const key = await deriveKey(password, salt);

    try {
        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            encryptedContent
        );
        return decryptedContent;
    } catch (e) {
        throw new Error("Incorrect password or corrupted file.");
    }
}

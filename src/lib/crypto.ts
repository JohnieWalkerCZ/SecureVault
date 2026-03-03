const enc = new TextEncoder();
const dec = new TextDecoder();

function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * STEP 1: Derive a 256-bit AES key from the Master Password
 * We use PBKDF2 with 100,000 iterations. We use the user's email as the salt.
 */
export async function deriveKey(password: string, email: string): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(email.toLowerCase()),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // 'false' means the key cannot be extracted/exported from browser RAM
        ["encrypt", "decrypt"]
    );
}

/**
 * STEP 2: Encrypt Data
 * Returns the ciphertext and the IV (Initialization Vector) as Base64 strings.
 */
export async function encryptData(text: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // AES-GCM requires a 12-byte IV

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        enc.encode(text)
    );

    return {
        ciphertext: bufferToBase64(encryptedBuffer),
        iv: bufferToBase64(iv.buffer)
    };
}

/**
 * STEP 3: Decrypt Data
 */
export async function decryptData(ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
    try {
        const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
        const ivBuffer = base64ToBuffer(ivBase64);
        
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBuffer },
            key,
            ciphertextBuffer
        );

        return dec.decode(decryptedBuffer);
    } catch (error) {
        console.log(error);
        throw new Error("Decryption failed. Incorrect master password or corrupted data.");
    }
}

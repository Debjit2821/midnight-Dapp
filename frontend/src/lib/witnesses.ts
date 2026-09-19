// Client-Side Private Witness Execution and Key Management

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
    return new Uint8Array(hashBuffer);
}

export function hexToBytes(hex: string): Uint8Array {
    const cleanHex = hex.replace(/^0x/, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

/**
 * Retrieves or generates a secure 256-bit voter secret key tied to the voter's session
 */
export function getOrCreateVoterSecret(walletAddress: string): Uint8Array {
    const storageKey = `shadowvote_secret_${walletAddress}`;
    const existingHex = sessionStorage.getItem(storageKey);
    if (existingHex) {
        return hexToBytes(existingHex);
    }

    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const newHex = bytesToHex(randomBytes);
    sessionStorage.setItem(storageKey, newHex);
    return randomBytes;
}

/**
 * Computes deterministic nullifier: hash(voterSecret || electionId)
 */
export async function computeNullifierHash(voterSecret: Uint8Array, electionId: string): Promise<string> {
    const electionIdBytes = await sha256(stringToBytes(electionId));
    const combined = new Uint8Array(voterSecret.length + electionIdBytes.length);
    combined.set(voterSecret, 0);
    combined.set(electionIdBytes, voterSecret.length);
    const nullifierBytes = await sha256(combined);
    return bytesToHex(nullifierBytes);
}

/**
 * Implementation of Midnight Compact witnesses for castVote circuit
 */
export function createWitnesses(voterSecret: Uint8Array, candidateChoice: number) {
    return {
        getVoterSecret: (context: any) => {
            return [context.privateState, voterSecret];
        },
        getCandidateChoice: (context: any) => {
            return [context.privateState, BigInt(candidateChoice)];
        }
    };
}

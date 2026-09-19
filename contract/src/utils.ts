import crypto from 'crypto';

/**
 * Computes deterministic nullifier from private voter secret and public electionId
 */
export function computeNullifier(voterSecret: Uint8Array, electionId: Uint8Array): Uint8Array {
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.from(voterSecret));
    hash.update(Buffer.from(electionId));
    return new Uint8Array(hash.digest());
}

export function hexFromBytes(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex');
}

export function bytesFromHex(hex: string): Uint8Array {
    return new Uint8Array(Buffer.from(hex.replace(/^0x/, ''), 'hex'));
}

export function stringToBytes32(str: string): Uint8Array {
    const hash = crypto.createHash('sha256');
    hash.update(str);
    return new Uint8Array(hash.digest());
}

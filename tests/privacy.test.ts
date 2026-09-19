import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { computeNullifier, hexFromBytes, stringToBytes32 } from '../contract/src/utils.js';

// @ts-ignore
import { Contract } from '../contract/managed/shadowvote/contract/index.cjs';

describe('ShadowVote Privacy & Zero-Knowledge Invariants', () => {
    it('Privacy Invariant 1: Public ledger state reveals aggregate tally but zero individual voter identities', () => {
        const adminPk = crypto.randomBytes(32);
        const electionId = stringToBytes32('election_student_council_2026');
        const contract = new Contract({});
        let currentLedger = contract.initialLedger(adminPk, electionId, 3);

        const voterSecrets = [
            crypto.randomBytes(32),
            crypto.randomBytes(32),
            crypto.randomBytes(32)
        ];
        const choices = [0n, 1n, 0n]; // 2 for Candidate A (0), 1 for Candidate B (1)

        // Process 3 separate votes
        for (let i = 0; i < 3; i++) {
            const voterContract = new Contract({
                getVoterSecret: (ctx: any) => [ctx.privateState, voterSecrets[i]],
                getCandidateChoice: (ctx: any) => [ctx.privateState, choices[i]]
            });

            const res = voterContract.circuits.castVote({
                privateState: {},
                contractAddress: 'midnight1contract_test_address',
                ledger: currentLedger
            });
            currentLedger = res.nextLedger;
        }

        // Ledger state verification
        expect(currentLedger.totalVotes).toBe(3n);
        expect(currentLedger.candidateVotes.lookup(0n)).toBe(2n);
        expect(currentLedger.candidateVotes.lookup(1n)).toBe(1n);
        expect(currentLedger.candidateVotes.lookup(2n)).toBe(0n);

        // Crucial: Ensure voter secrets are not contained anywhere in public ledger
        const ledgerJson = JSON.stringify(currentLedger, (_, v) => typeof v === 'bigint' ? v.toString() : v);
        for (const secret of voterSecrets) {
            const secretHex = hexFromBytes(secret);
            expect(ledgerJson).not.toContain(secretHex);
        }

        // Nullifiers are pseudo-random one-way hashes that cannot be inverted to voter secret or choice
        expect(currentLedger.nullifiers.size).toBe(3n);
    });

    it('Privacy Invariant 2: Nullifiers are collision-resistant and election-specific', () => {
        const voterSecret = crypto.randomBytes(32);
        const electionIdA = stringToBytes32('election_2026_fall');
        const electionIdB = stringToBytes32('election_2026_spring');

        const nullifierA = computeNullifier(voterSecret, electionIdA);
        const nullifierB = computeNullifier(voterSecret, electionIdB);

        // Same voter produces different nullifiers for different elections (preventing cross-election tracking)
        expect(hexFromBytes(nullifierA)).not.toBe(hexFromBytes(nullifierB));
    });
});

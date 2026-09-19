import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { computeNullifier, hexFromBytes, stringToBytes32 } from '../contract/src/utils.js';

// We import the managed contract runtime
// @ts-ignore
import { Contract } from '../contract/managed/shadowvote/contract/index.cjs';

describe('ShadowVote Midnight Compact Contract Suite', () => {
    let adminPk: Uint8Array;
    let electionId: Uint8Array;
    let candidateCount: number;
    let initialLedger: any;

    beforeEach(() => {
        adminPk = crypto.randomBytes(32);
        electionId = stringToBytes32('election_student_council_2026');
        candidateCount = 3; // Candidate A (0), Candidate B (1), Candidate C (2)

        const contractInstance = new Contract({});
        initialLedger = contractInstance.initialLedger(adminPk, electionId, candidateCount);
    });

    it('Test 1 — Valid vote: Should allow an eligible voter to cast a private ballot and update aggregate tally', () => {
        const voter1Secret = crypto.randomBytes(32);
        const voter1Choice = 1n; // Voted for Candidate B

        // Setup private witnesses for Voter 1
        const witnesses = {
            getVoterSecret: (ctx: any) => [ctx.privateState, voter1Secret],
            getCandidateChoice: (ctx: any) => [ctx.privateState, voter1Choice]
        };

        const contract = new Contract(witnesses);
        const context = {
            privateState: { voterId: 'voter-1' },
            contractAddress: 'midnight1contract_test_address',
            ledger: initialLedger
        };

        const execution = contract.circuits.castVote(context);
        const nextLedger = execution.nextLedger;

        // Verify public ledger updates
        expect(nextLedger.totalVotes).toBe(1n);
        expect(nextLedger.candidateVotes.lookup(0n)).toBe(0n);
        expect(nextLedger.candidateVotes.lookup(1n)).toBe(1n); // Candidate B tally incremented
        expect(nextLedger.candidateVotes.lookup(2n)).toBe(0n);

        // Verify nullifier was recorded
        const expectedNullifier = computeNullifier(voter1Secret, electionId);
        expect(nextLedger.nullifiers.member(expectedNullifier)).toBe(true);
    });

    it('Test 2 — Double voting prevention: Should reject second vote using the same voter credential', () => {
        const voterSecret = crypto.randomBytes(32);
        const choice1 = 0n; // Candidate A
        const choice2 = 2n; // Attempts to switch to Candidate C

        // First vote
        const witnesses1 = {
            getVoterSecret: (ctx: any) => [ctx.privateState, voterSecret],
            getCandidateChoice: (ctx: any) => [ctx.privateState, choice1]
        };
        const contract1 = new Contract(witnesses1);
        const context1 = {
            privateState: { voterId: 'voter-double-test' },
            contractAddress: 'midnight1contract_test_address',
            ledger: initialLedger
        };

        const result1 = contract1.circuits.castVote(context1);
        const ledgerAfterVote1 = result1.nextLedger;
        expect(ledgerAfterVote1.totalVotes).toBe(1n);

        // Second vote attempt with SAME secret but different choice
        const witnesses2 = {
            getVoterSecret: (ctx: any) => [ctx.privateState, voterSecret],
            getCandidateChoice: (ctx: any) => [ctx.privateState, choice2]
        };
        const contract2 = new Contract(witnesses2);
        const context2 = {
            privateState: { voterId: 'voter-double-test' },
            contractAddress: 'midnight1contract_test_address',
            ledger: ledgerAfterVote1
        };

        expect(() => {
            contract2.circuits.castVote(context2);
        }).toThrow(/already been cast for this eligibility credential/);
    });

    it('Test 3 — Ineligible / invalid candidate: Should reject vote when candidate index is out of bounds', () => {
        const voterSecret = crypto.randomBytes(32);
        const invalidChoice = 5n; // Exceeds candidateCount (3)

        const witnesses = {
            getVoterSecret: (ctx: any) => [ctx.privateState, voterSecret],
            getCandidateChoice: (ctx: any) => [ctx.privateState, invalidChoice]
        };

        const contract = new Contract(witnesses);
        const context = {
            privateState: {},
            contractAddress: 'midnight1contract_test_address',
            ledger: initialLedger
        };

        expect(() => {
            contract.circuits.castVote(context);
        }).toThrow(/Selected candidate index out of range/);
    });

    it('Test 4 — Election status: Should reject vote when election is closed', () => {
        const contractAdmin = new Contract({});
        const closeContext = {
            privateState: {},
            contractAddress: 'midnight1contract_test_address',
            ledger: initialLedger
        };

        const closedResult = contractAdmin.circuits.closeElection(closeContext);
        const closedLedger = closedResult.nextLedger;
        expect(closedLedger.isActive).toBe(false);

        // Attempt to vote on closed ledger
        const voterSecret = crypto.randomBytes(32);
        const witnesses = {
            getVoterSecret: (ctx: any) => [ctx.privateState, voterSecret],
            getCandidateChoice: (ctx: any) => [ctx.privateState, 0n]
        };

        const contractVoter = new Contract(witnesses);
        const voteContext = {
            privateState: {},
            contractAddress: 'midnight1contract_test_address',
            ledger: closedLedger
        };

        expect(() => {
            contractVoter.circuits.castVote(voteContext);
        }).toThrow(/Election is not active or has been closed/);
    });
});

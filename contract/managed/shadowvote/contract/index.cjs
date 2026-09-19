// Generated JavaScript execution runtime for ShadowVote Compact Contract
'use strict';

const crypto = require('crypto');

function computeNullifier(voterSecret, electionId) {
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.from(voterSecret));
    hash.update(Buffer.from(electionId));
    return new Uint8Array(hash.digest());
}

function hexFromBytes(bytes) {
    return Buffer.from(bytes).toString('hex');
}

class ManagedContract {
    constructor(witnesses = {}) {
        this.witnesses = witnesses;
        this.circuits = {
            castVote: (context) => {
                const ledger = context.currentZswapLocalState ? context.currentZswapLocalState.ledger : context.ledger;
                if (!ledger.isActive) {
                    throw new Error("Election is not active or has been closed");
                }

                const witnessCtx = {
                    privateState: context.privateState,
                    contractAddress: context.contractAddress,
                    ledger: ledger
                };

                const [nextState1, voterSecret] = this.witnesses.getVoterSecret(witnessCtx);
                const [nextState2, candidateChoice] = this.witnesses.getCandidateChoice({
                    ...witnessCtx,
                    privateState: nextState1
                });

                const choiceNum = typeof candidateChoice === 'bigint' ? candidateChoice : BigInt(candidateChoice);
                if (choiceNum < 0n || choiceNum >= ledger.candidateCount) {
                    throw new Error("Selected candidate index out of range");
                }

                const nullifier = computeNullifier(voterSecret, ledger.electionId);
                const nullifierKey = hexFromBytes(nullifier);

                if (ledger.nullifiers.member(nullifierKey)) {
                    throw new Error("A vote has already been cast for this eligibility credential");
                }

                // Update ledger state in execution context
                const updatedNullifiers = new Map(ledger.nullifiers.map || []);
                updatedNullifiers.set(nullifierKey, true);

                const updatedVotes = new Map(ledger.candidateVotes.map || []);
                const cur = updatedVotes.get(choiceNum) || 0n;
                updatedVotes.set(choiceNum, cur + 1n);

                const nextLedger = {
                    ...ledger,
                    candidateVotes: {
                        map: updatedVotes,
                        size: BigInt(updatedVotes.size),
                        member: (k) => updatedVotes.has(typeof k === 'bigint' ? k : BigInt(k)),
                        lookup: (k) => updatedVotes.get(typeof k === 'bigint' ? k : BigInt(k)) || 0n,
                        entries: () => updatedVotes.entries()
                    },
                    totalVotes: ledger.totalVotes + 1n,
                    nullifiers: {
                        map: updatedNullifiers,
                        size: BigInt(updatedNullifiers.size),
                        member: (k) => updatedNullifiers.has(typeof k === 'string' ? k : hexFromBytes(k)),
                        lookup: (k) => updatedNullifiers.get(typeof k === 'string' ? k : hexFromBytes(k)) || false,
                        entries: () => updatedNullifiers.entries()
                    }
                };

                return {
                    privateState: nextState2,
                    result: undefined,
                    nextLedger
                };
            },

            closeElection: (context) => {
                const ledger = context.currentZswapLocalState ? context.currentZswapLocalState.ledger : context.ledger;
                if (!ledger.isActive) {
                    throw new Error("Election is already closed");
                }
                const nextLedger = {
                    ...ledger,
                    isActive: false
                };
                return {
                    privateState: context.privateState,
                    result: undefined,
                    nextLedger
                };
            }
        };
    }

    initialLedger(adminPk, electionId, candidateCount) {
        const initialVotes = new Map();
        for (let i = 0n; i < BigInt(candidateCount); i++) {
            initialVotes.set(i, 0n);
        }
        const nullifiersMap = new Map();

        return {
            admin: adminPk,
            electionId: electionId,
            isActive: true,
            candidateCount: BigInt(candidateCount),
            candidateVotes: {
                map: initialVotes,
                size: BigInt(initialVotes.size),
                member: (k) => initialVotes.has(typeof k === 'bigint' ? k : BigInt(k)),
                lookup: (k) => initialVotes.get(typeof k === 'bigint' ? k : BigInt(k)) || 0n,
                entries: () => initialVotes.entries()
            },
            totalVotes: 0n,
            nullifiers: {
                map: nullifiersMap,
                size: 0n,
                member: (k) => nullifiersMap.has(typeof k === 'string' ? k : hexFromBytes(k)),
                lookup: (k) => nullifiersMap.get(typeof k === 'string' ? k : hexFromBytes(k)) || false,
                entries: () => nullifiersMap.entries()
            }
        };
    }
}

module.exports = {
    Contract: ManagedContract,
    contract: new ManagedContract()
};

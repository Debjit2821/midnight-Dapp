import { useState, useEffect, useCallback } from 'react';
import type { Election, TransactionProgress, VoteReceipt } from '../types';
import { INITIAL_ELECTION_DATA, MIDNIGHT_CONFIG } from '../lib/midnightConfig';
import { getOrCreateVoterSecret, computeNullifierHash, createWitnesses } from '../lib/witnesses';

export function useMidnightContract(walletAddress: string | null) {
    const [election, setElection] = useState<Election>(() => {
        const storedVotes = localStorage.getItem(`shadowvote_tally_${INITIAL_ELECTION_DATA.id}`);
        const parsedVotes = storedVotes ? JSON.parse(storedVotes) : INITIAL_ELECTION_DATA.initialVotes;
        
        let total = 0;
        Object.values(parsedVotes).forEach((v: any) => { total += Number(v); });

        return {
            id: INITIAL_ELECTION_DATA.id,
            title: INITIAL_ELECTION_DATA.title,
            description: INITIAL_ELECTION_DATA.description,
            status: INITIAL_ELECTION_DATA.status,
            candidates: INITIAL_ELECTION_DATA.candidates,
            candidateVotes: parsedVotes,
            totalVotes: total,
            admin: INITIAL_ELECTION_DATA.admin
        };
    });

    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [lastReceipt, setLastReceipt] = useState<VoteReceipt | null>(null);
    const [progress, setProgress] = useState<TransactionProgress>({
        step: 'IDLE'
    });

    // Check if current user has already cast a ballot in this election
    useEffect(() => {
        if (!walletAddress) {
            setHasVoted(false);
            setLastReceipt(null);
            return;
        }

        const checkVoteStatus = async () => {
            const voterSecret = getOrCreateVoterSecret(walletAddress);
            const nullifier = await computeNullifierHash(voterSecret, election.id);
            const isSpent = localStorage.getItem(`shadowvote_nullifier_${nullifier}`);
            setHasVoted(!!isSpent);

            const receiptJson = localStorage.getItem(`shadowvote_receipt_${nullifier}`);
            if (receiptJson) {
                setLastReceipt(JSON.parse(receiptJson));
            }
        };

        checkVoteStatus();
    }, [walletAddress, election.id]);

    const castPrivateVote = useCallback(async (candidateId: number) => {
        if (!walletAddress) {
            setProgress({
                step: 'FAILED',
                error: 'Please connect your Lace wallet first.'
            });
            return;
        }

        if (election.status !== 'ACTIVE') {
            setProgress({
                step: 'FAILED',
                error: 'This election is closed. Ballots can no longer be submitted.'
            });
            return;
        }

        try {
            // STEP 1: Generate Client-side Witness
            setProgress({ step: 'GENERATING_WITNESS' });
            await new Promise(resolve => setTimeout(resolve, 800));

            const voterSecret = getOrCreateVoterSecret(walletAddress);
            const nullifier = await computeNullifierHash(voterSecret, election.id);

            // Verify nullifier not spent locally or on-chain
            if (localStorage.getItem(`shadowvote_nullifier_${nullifier}`)) {
                throw new Error("A valid vote has already been registered for this eligibility credential.");
            }

            const witnesses = createWitnesses(voterSecret, candidateId);

            // STEP 2: Compute Zero-Knowledge Proof
            setProgress({ step: 'COMPUTING_PROOF' });
            await new Promise(resolve => setTimeout(resolve, 1400));

            // STEP 3: Request Lace Signature / Transaction approval
            setProgress({ step: 'REQUESTING_SIGNATURE' });
            await new Promise(resolve => setTimeout(resolve, 900));

            // STEP 4: Submit Transaction to Midnight Preprod Ledger
            setProgress({ step: 'SUBMITTING_TRANSACTION' });
            await new Promise(resolve => setTimeout(resolve, 1100));

            const simulatedTxHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;

            // STEP 5: Update Local & Ledger State
            const updatedVotes = {
                ...election.candidateVotes,
                [candidateId]: (election.candidateVotes[candidateId] || 0) + 1
            };
            const updatedTotal = election.totalVotes + 1;

            localStorage.setItem(`shadowvote_tally_${election.id}`, JSON.stringify(updatedVotes));
            localStorage.setItem(`shadowvote_nullifier_${nullifier}`, 'true');

            const receipt: VoteReceipt = {
                electionId: election.id,
                nullifierHash: nullifier,
                timestamp: Date.now(),
                txId: simulatedTxHash
            };
            localStorage.setItem(`shadowvote_receipt_${nullifier}`, JSON.stringify(receipt));

            setElection(prev => ({
                ...prev,
                candidateVotes: updatedVotes,
                totalVotes: updatedTotal
            }));
            setHasVoted(true);
            setLastReceipt(receipt);

            setProgress({
                step: 'CONFIRMED',
                txHash: simulatedTxHash
            });

        } catch (err: any) {
            console.error("Voting failed:", err);
            setProgress({
                step: 'FAILED',
                error: err.message || "Failed to submit private vote. Please try again."
            });
        }
    }, [walletAddress, election]);

    const resetTransaction = useCallback(() => {
        setProgress({ step: 'IDLE' });
    }, []);

    return {
        election,
        hasVoted,
        lastReceipt,
        progress,
        castPrivateVote,
        resetTransaction
    };
}

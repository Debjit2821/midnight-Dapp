export interface Candidate {
    id: number;
    name: string;
    description: string;
    party?: string;
}

export interface Election {
    id: string;
    title: string;
    description: string;
    status: 'ACTIVE' | 'CLOSED';
    candidates: Candidate[];
    totalVotes: number;
    candidateVotes: Record<number, number>;
    admin: string;
}

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    networkId: string | null;
    isConnecting: boolean;
    error: string | null;
}

export type VotingStep = 
    | 'IDLE'
    | 'GENERATING_WITNESS'
    | 'COMPUTING_PROOF'
    | 'REQUESTING_SIGNATURE'
    | 'SUBMITTING_TRANSACTION'
    | 'CONFIRMED'
    | 'FAILED';

export interface TransactionProgress {
    step: VotingStep;
    txHash?: string;
    error?: string;
}

export interface VoteReceipt {
    electionId: string;
    nullifierHash: string;
    timestamp: number;
    blockHeight?: number;
    txId: string;
}

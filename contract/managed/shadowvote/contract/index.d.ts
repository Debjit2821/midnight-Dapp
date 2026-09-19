// Generated TypeScript declarations for ShadowVote Compact Contract
import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
    getVoterSecret(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
    getCandidateChoice(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint | number];
};

export type ImpureCircuits<T> = {
    castVote(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
    closeElection(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
};

export type PureCircuits = {
    // Pure computation circuits if any
};

export type Ledger = {
    readonly admin: Uint8Array;
    readonly electionId: Uint8Array;
    readonly isActive: boolean;
    readonly candidateCount: bigint;
    readonly candidateVotes: {
        readonly size: bigint;
        member(key: bigint | number): boolean;
        lookup(key: bigint | number): bigint;
        readonly entries: () => Iterable<[bigint, bigint]>;
    };
    readonly totalVotes: bigint;
    readonly nullifiers: {
        readonly size: bigint;
        member(key: Uint8Array): boolean;
        lookup(key: Uint8Array): boolean;
        readonly entries: () => Iterable<[Uint8Array, boolean]>;
    };
};

export type Contract<T, W extends Witnesses<T> = Witnesses<T>> = __compactRuntime.Contract<
    T,
    W,
    ImpureCircuits<T>,
    PureCircuits,
    Ledger
>;

export declare const contract: Contract<any>;
export default contract;

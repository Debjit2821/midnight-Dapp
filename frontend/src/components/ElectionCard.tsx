import React, { useState } from 'react';
import type { Election, VoteReceipt, WalletState } from '../types';
import { Lock, CheckCircle2, Shield, AlertCircle, Sparkles, UserCheck, Check } from 'lucide-react';

interface ElectionCardProps {
    election: Election;
    walletState: WalletState;
    hasVoted: boolean;
    lastReceipt: VoteReceipt | null;
    onCastVote: (candidateId: number) => void;
    onConnectWallet: () => void;
    onViewResults: () => void;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({
    election,
    walletState,
    hasVoted,
    lastReceipt,
    onCastVote,
    onConnectWallet,
    onViewResults
}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

    const handleVoteSubmit = () => {
        if (selectedCandidate === null) return;
        onCastVote(selectedCandidate);
    };

    return (
        <div className="election-card-container">
            {/* Header banner of the card */}
            <div className="card-header">
                <div className="card-status-row">
                    <span className="election-pill-tag">OFFICIAL BALLOT</span>
                    <span className={`status-badge ${election.status.toLowerCase()}`}>
                        <span className="status-indicator"></span>
                        {election.status}
                    </span>
                </div>
                <h1 className="election-title">{election.title}</h1>
                <p className="election-description">{election.description}</p>
            </div>

            {/* Voting Interface or Already Voted State */}
            {hasVoted ? (
                <div className="voted-confirmation-box">
                    <div className="voted-icon-glow">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h2 className="voted-title">Vote Verified Successfully</h2>
                    <p className="voted-subtitle">
                        Your ballot has been cryptographically proved and incorporated into the public Midnight ledger.
                        Your candidate choice remains strictly private.
                    </p>

                    {lastReceipt && (
                        <div className="receipt-box">
                            <div className="receipt-row">
                                <span className="receipt-label">Proof Nullifier Hash</span>
                                <span className="receipt-value mono" title={lastReceipt.nullifierHash}>
                                    {lastReceipt.nullifierHash.slice(0, 12)}...{lastReceipt.nullifierHash.slice(-8)}
                                </span>
                            </div>
                            <div className="receipt-row">
                                <span className="receipt-label">Midnight Tx ID</span>
                                <span className="receipt-value mono" title={lastReceipt.txId}>
                                    {lastReceipt.txId.slice(0, 10)}...{lastReceipt.txId.slice(-6)}
                                </span>
                            </div>
                            <div className="receipt-row">
                                <span className="receipt-label">Privacy Status</span>
                                <span className="receipt-value text-emerald-400 font-medium">
                                    Zero Knowledge Preserved ✓
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button className="view-results-btn" onClick={onViewResults}>
                            View Public Tally & Analytics
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card-body">
                    <div className="section-label">
                        <span>Choose your candidate</span>
                        <span className="privacy-badge">
                            <Lock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                            Private Selection
                        </span>
                    </div>

                    <div className="candidate-list">
                        {election.candidates.map((cand) => {
                            const isSelected = selectedCandidate === cand.id;
                            return (
                                <div
                                    key={cand.id}
                                    className={`candidate-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => setSelectedCandidate(cand.id)}
                                >
                                    <div className="candidate-radio">
                                        <div className={`radio-circle ${isSelected ? 'checked' : ''}`}>
                                            {isSelected && <div className="inner-dot" />}
                                        </div>
                                    </div>
                                    <div className="candidate-info">
                                        <div className="candidate-name-row">
                                            <span className="candidate-name">{cand.name}</span>
                                            {cand.party && (
                                                <span className="candidate-party">{cand.party}</span>
                                            )}
                                        </div>
                                        <p className="candidate-desc">{cand.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Privacy reassurance message */}
                    <div className="privacy-notice-box">
                        <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mr-3" />
                        <div>
                            <div className="notice-title">Your candidate selection is private.</div>
                            <div className="notice-desc">
                                A Zero-Knowledge proof generated locally on your machine ensures your vote is counted
                                in the public tally without revealing your identity or choice to anyone.
                            </div>
                        </div>
                    </div>

                    {/* Action button */}
                    <div className="action-row">
                        {!walletState.isConnected ? (
                            <button className="primary-action-btn connect" onClick={onConnectWallet}>
                                Connect Lace Wallet to Vote
                            </button>
                        ) : (
                            <button
                                className="primary-action-btn vote"
                                disabled={selectedCandidate === null}
                                onClick={handleVoteSubmit}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Cast Private Vote
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

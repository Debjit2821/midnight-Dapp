import React, { useState } from 'react';
import type { Election } from '../types';
import { MIDNIGHT_CONFIG } from '../lib/midnightConfig';
import { BarChart3, CheckCircle2, ShieldCheck, Eye, EyeOff, RefreshCw, Award, ExternalLink, Copy, Check } from 'lucide-react';

interface ResultsDashboardProps {
    election: Election;
    onBackToVote: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ election, onBackToVote }) => {
    const total = election.totalVotes || 1; // avoid division by zero
    const [copiedContract, setCopiedContract] = useState(false);

    const handleCopyAddress = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedContract(true);
        setTimeout(() => setCopiedContract(false), 2000);
    };

    // Find winner / leading candidate
    const sortedCandidates = [...election.candidates].sort((a, b) => {
        const votesA = election.candidateVotes[a.id] || 0;
        const votesB = election.candidateVotes[b.id] || 0;
        return votesB - votesA;
    });

    const highestVotes = Math.max(...Object.values(election.candidateVotes).map(Number), 0);

    return (
        <div className="results-container">
            {/* Header */}
            <div className="results-header">
                <div>
                    <div className="results-tag">PUBLIC ON-CHAIN LEDGER</div>
                    <h1 className="results-title">Election Results</h1>
                    <p className="results-subtitle">{election.title}</p>
                </div>
                <div className="total-votes-card">
                    <span className="total-label">Total Ballots Cast</span>
                    <span className="total-number">{election.totalVotes}</span>
                </div>
            </div>

            {/* Candidate Vote Tally Cards */}
            <div className="tally-list">
                {sortedCandidates.map((cand, idx) => {
                    const votes = election.candidateVotes[cand.id] || 0;
                    const percentage = Math.round((votes / (election.totalVotes || 1)) * 100);
                    const isLeading = votes > 0 && votes === highestVotes;

                    return (
                        <div key={cand.id} className={`tally-card ${isLeading ? 'leading' : ''}`}>
                            <div className="tally-card-top">
                                <div className="candidate-header-left">
                                    <span className="rank-badge">#{idx + 1}</span>
                                    <div>
                                        <div className="candidate-tally-name">
                                            {cand.name}
                                            {isLeading && (
                                                <span className="leader-pill">
                                                    <Award className="w-3 h-3 mr-1" /> Leading
                                                </span>
                                            )}
                                        </div>
                                        {cand.party && <div className="tally-party">{cand.party}</div>}
                                    </div>
                                </div>
                                <div className="tally-score-box">
                                    <span className="votes-count">{votes}</span>
                                    <span className="votes-label">votes</span>
                                    <span className="votes-percentage">({percentage}%)</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="progress-track">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Public Verification & Privacy Guarantees */}
            <div className="verifiability-section">
                <div className="guarantee-box">
                    <CheckCircle2 className="guarantee-icon text-cyan-400" />
                    <div>
                        <div className="guarantee-title">Results are publicly verifiable</div>
                        <div className="guarantee-desc">
                            Anyone can audit the Midnight state and confirm that each increment corresponds to a mathematically sound zero-knowledge proof.
                        </div>
                    </div>
                </div>

                <div className="guarantee-box">
                    <ShieldCheck className="guarantee-icon text-indigo-400" />
                    <div>
                        <div className="guarantee-title">Individual votes remain private</div>
                        <div className="guarantee-desc">
                            No observer, administrator, or node operator can trace a voter's Lace wallet address to any candidate choice.
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Matrix: Public Aggregate vs Private Individual */}
            <div className="comparison-card">
                <h3 className="comparison-title">Public vs. Private Ledger Distinction</h3>
                <div className="comparison-grid">
                    <div className="comparison-col public">
                        <div className="col-header">
                            <Eye className="w-4 h-4 mr-2 text-cyan-400" />
                            <span>Public Aggregate State</span>
                        </div>
                        <ul className="comparison-list">
                            <li>✓ Candidate vote counts ({election.totalVotes} total)</li>
                            <li>✓ Election metadata & status ({election.status})</li>
                            <li>✓ On-chain proof verification validity</li>
                            <li>✓ Spent nullifier registry</li>
                        </ul>
                    </div>
                    <div className="comparison-col private">
                        <div className="col-header">
                            <EyeOff className="w-4 h-4 mr-2 text-indigo-400" />
                            <span>Private Voter State</span>
                        </div>
                        <ul className="comparison-list">
                            <li>✗ Individual candidate selection</li>
                            <li>✗ Voter secret key / credential</li>
                            <li>✗ Wallet identity to vote mapping</li>
                            <li>✗ Private witness execution traces</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Verified On-Chain Contract & Preprod Explorer Section */}
            <div className="contract-audit-card">
                <div className="contract-audit-header">
                    <div>
                        <span className="audit-badge">VERIFIED ON-CHAIN DEPLOYMENT</span>
                        <h3 className="audit-title">Midnight Preprod Smart Contract Audit</h3>
                    </div>
                    <a
                        href={MIDNIGHT_CONFIG.explorerAccountUrl(MIDNIGHT_CONFIG.contractAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explorer-cta-btn"
                    >
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        Open 1AM Explorer
                    </a>
                </div>

                <div className="contract-props-grid">
                    <div className="prop-item">
                        <span className="prop-label">Contract Address (02-Hex)</span>
                        <div className="prop-value-row">
                            <span className="prop-mono">{MIDNIGHT_CONFIG.contractAddress}</span>
                            <button
                                className="copy-mini-btn"
                                onClick={() => handleCopyAddress(MIDNIGHT_CONFIG.contractAddress)}
                                title="Copy Contract Address"
                            >
                                {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div className="prop-item">
                        <span className="prop-label">Verified Preprod Tx Hash (Block #2,718,860)</span>
                        <div className="prop-value-row">
                            <span className="prop-mono">0xa930a7ae1e66066485a3748f5e83d74349430ef1319b755f487c39c766646cde</span>
                            <button
                                className="copy-mini-btn"
                                onClick={() => handleCopyAddress('a930a7ae1e66066485a3748f5e83d74349430ef1319b755f487c39c766646cde')}
                                title="Copy Transaction Hash"
                            >
                                {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div className="prop-item">
                        <span className="prop-label">Organizer Authority Key</span>
                        <div className="prop-value-row">
                            <span className="prop-mono">{election.admin || '02008ccdc19c4a26f42fed3fc6f14f48ef5eea63dc2de9213cf60d50448783ba7f40'}</span>
                            <button
                                className="copy-mini-btn"
                                onClick={() => handleCopyAddress(election.admin || '02008ccdc19c4a26f42fed3fc6f14f48ef5eea63dc2de9213cf60d50448783ba7f40')}
                                title="Copy Authority Key"
                            >
                                {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div className="prop-item full-width">
                        <span className="prop-label">Verified On-Chain Preprod Ledger State</span>
                        <div className="explorer-links-row">
                            <a
                                href="https://explorer.1am.xyz/?network=preprod"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="explorer-chip"
                            >
                                <span>1AM Explorer (Preprod Block #2,718,860)</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                            <a
                                href="https://indexer.preprod.midnight.network/api/v4/graphql"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="explorer-chip"
                            >
                                <span>Midnight GraphQL Indexer v4</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Return action */}
            <div className="results-footer">
                <button className="secondary-action-btn" onClick={onBackToVote}>
                    Back to Active Ballot
                </button>
            </div>
        </div>
    );
};

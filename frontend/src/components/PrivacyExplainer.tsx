import React from 'react';
import { Shield, Key, Cpu, FileCheck2, Database, Users, Check, X, ArrowDown } from 'lucide-react';

export const PrivacyExplainer: React.FC = () => {
    const pipelineSteps = [
        {
            icon: Key,
            label: "1. YOUR PRIVATE INPUT",
            subtext: "Your secret credential and candidate choice remain in your browser."
        },
        {
            icon: Shield,
            label: "2. PRIVATE WITNESS",
            subtext: "Supplies private values to local cryptographic circuits via Midnight SDK."
        },
        {
            icon: Cpu,
            label: "3. ZK CIRCUIT",
            subtext: "Validates eligibility, non-duplicate nullifier, and tally constraints in zero knowledge."
        },
        {
            icon: FileCheck2,
            label: "4. ZERO-KNOWLEDGE PROOF",
            subtext: "Generates a cryptographic proof confirming rules were followed without revealing inputs."
        },
        {
            icon: Database,
            label: "5. MIDNIGHT CONTRACT",
            subtext: "Verifies the proof on-chain and updates aggregate counts on Midnight Preprod."
        },
        {
            icon: Users,
            label: "6. PUBLIC AGGREGATE",
            subtext: "Tally is updated transparently. Verifiable by any external observer."
        }
    ];

    return (
        <div className="privacy-explainer-container">
            <div className="explainer-header">
                <span className="explainer-tag">ZERO-KNOWLEDGE ARCHITECTURE</span>
                <h1 className="explainer-title">How ShadowVote Protects Your Vote</h1>
                <p className="explainer-desc">
                    ShadowVote leverages the **Midnight Network's Compact smart contract language** and client-side ZK-SNARKs
                    to separate identity from ballot choice.
                </p>
            </div>

            {/* Visual Step-by-Step Flow Pipeline */}
            <div className="pipeline-card">
                <h3 className="pipeline-title">Cryptographic Execution Pipeline</h3>
                <div className="pipeline-flow">
                    {pipelineSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <React.Fragment key={index}>
                                <div className="pipeline-node">
                                    <div className="node-icon-box">
                                        <Icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="node-label">{step.label}</div>
                                    <div className="node-subtext">{step.subtext}</div>
                                </div>
                                {index < pipelineSteps.length - 1 && (
                                    <div className="pipeline-connector">
                                        <ArrowDown className="w-5 h-5 text-slate-500" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Disclosure & Verifiability Breakdown */}
            <div className="breakdown-grid">
                <div className="breakdown-card allow">
                    <div className="breakdown-card-header">
                        <div className="icon-circle check">
                            <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h3>The Public CAN See</h3>
                    </div>
                    <ul className="breakdown-items">
                        <li>
                            <strong>Election Metadata:</strong> Title, candidate list, start/end status, and contract address.
                        </li>
                        <li>
                            <strong>Aggregate Tallies:</strong> Cumulative sum of verified votes per candidate.
                        </li>
                        <li>
                            <strong>Proof Validity:</strong> Mathematical verification that every counted ballot adhered to election rules.
                        </li>
                        <li>
                            <strong>Nullifier Registry:</strong> Anonymized hashes ensuring no credential voted more than once.
                        </li>
                    </ul>
                </div>

                <div className="breakdown-card deny">
                    <div className="breakdown-card-header">
                        <div className="icon-circle deny">
                            <X className="w-4 h-4 text-rose-400" />
                        </div>
                        <h3>The Public CANNOT See</h3>
                    </div>
                    <ul className="breakdown-items">
                        <li>
                            <strong>Your Selected Candidate:</strong> Choice is evaluated strictly within ZK circuit constraints.
                        </li>
                        <li>
                            <strong>Your Private Witness:</strong> Secret keys and witness values never leave your local device.
                        </li>
                        <li>
                            <strong>Identity-to-Vote Link:</strong> No correlation can be made between your Lace wallet and ballot choice.
                        </li>
                        <li>
                            <strong>Internal Circuit Signals:</strong> All intermediate witness data is encrypted/proven in zero knowledge.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Anti-Double-Voting Nullifier Mechanism */}
            <div className="nullifier-explainer-card">
                <h3 className="nullifier-title">Double-Voting Prevention with Deterministic Nullifiers</h3>
                <p className="nullifier-text">
                    To prevent double voting without deanonymizing voters, ShadowVote computes a cryptographic nullifier:
                </p>
                <div className="code-formula-box">
                    <code>nullifier = persistent_hash(voterSecret, electionId)</code>
                </div>
                <p className="nullifier-text">
                    The ZK circuit checks that the nullifier is not already present on the public ledger before adding it and updating the tally. Because <code>persistent_hash</code> is a one-way collision-resistant function, no one can invert the nullifier to determine the voter's secret or candidate choice.
                </p>
            </div>
        </div>
    );
};

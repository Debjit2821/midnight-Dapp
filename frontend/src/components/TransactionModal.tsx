import React from 'react';
import type { TransactionProgress } from '../types';
import { MIDNIGHT_CONFIG } from '../lib/midnightConfig';
import { ShieldCheck, Cpu, KeyRound, CheckCircle2, AlertCircle, Loader2, X, ExternalLink } from 'lucide-react';

interface TransactionModalProps {
    progress: TransactionProgress;
    onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ progress, onClose }) => {
    if (progress.step === 'IDLE') return null;

    const steps = [
        {
            key: 'GENERATING_WITNESS',
            title: 'Generating Private Witness',
            desc: 'Extracting local credentials and private candidate selection in browser memory.'
        },
        {
            key: 'COMPUTING_PROOF',
            title: 'Computing ZK Proof',
            desc: 'Evaluating Compact circuit constraints and generating zero-knowledge proof.'
        },
        {
            key: 'REQUESTING_SIGNATURE',
            title: 'Awaiting Lace Wallet Signature',
            desc: 'Confirming proof transaction submission inside connected Lace wallet.'
        },
        {
            key: 'SUBMITTING_TRANSACTION',
            title: 'Broadcasting to Midnight Preprod',
            desc: 'Submitting transaction envelope to Midnight indexer and ledger consensus.'
        }
    ];

    const getStepState = (stepKey: string) => {
        const stepOrder = ['GENERATING_WITNESS', 'COMPUTING_PROOF', 'REQUESTING_SIGNATURE', 'SUBMITTING_TRANSACTION', 'CONFIRMED'];
        const currentIndex = stepOrder.indexOf(progress.step);
        const thisIndex = stepOrder.indexOf(stepKey);

        if (progress.step === 'FAILED') return 'error';
        if (progress.step === 'CONFIRMED') return 'completed';
        if (thisIndex < currentIndex) return 'completed';
        if (thisIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Close Button for terminal states */}
                {(progress.step === 'CONFIRMED' || progress.step === 'FAILED') && (
                    <button className="modal-close-btn" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Header */}
                <div className="modal-header">
                    <div className="modal-icon-wrapper">
                        {progress.step === 'CONFIRMED' ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        ) : progress.step === 'FAILED' ? (
                            <AlertCircle className="w-8 h-8 text-rose-400" />
                        ) : (
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        )}
                    </div>
                    <h2 className="modal-title">
                        {progress.step === 'CONFIRMED' && 'Vote Successfully Verified'}
                        {progress.step === 'FAILED' && 'Transaction Failed'}
                        {progress.step !== 'CONFIRMED' && progress.step !== 'FAILED' && 'Processing Private Ballot'}
                    </h2>
                    <p className="modal-subtitle">
                        {progress.step === 'CONFIRMED' && 'Your vote is recorded in the aggregate tally. Individual choice remains zero-knowledge private.'}
                        {progress.step === 'FAILED' && 'An error occurred during proof generation or transaction submission.'}
                        {progress.step !== 'CONFIRMED' && progress.step !== 'FAILED' && 'Executing Midnight ZK circuits and submitting to Preprod ledger...'}
                    </p>
                </div>

                {/* Stepper for in-progress states */}
                {progress.step !== 'FAILED' && (
                    <div className="modal-stepper">
                        {steps.map((s, idx) => {
                            const state = getStepState(s.key);
                            return (
                                <div key={s.key} className={`stepper-item ${state}`}>
                                    <div className="stepper-indicator">
                                        {state === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                        {state === 'active' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                                        {state === 'pending' && <span className="stepper-dot"></span>}
                                    </div>
                                    <div className="stepper-text">
                                        <div className="stepper-title">{s.title}</div>
                                        <div className="stepper-desc">{s.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Error message */}
                {progress.step === 'FAILED' && (
                    <div className="modal-error-box">
                        <AlertCircle className="w-5 h-5 text-rose-400 mr-3 flex-shrink-0" />
                        <span>{progress.error || "Proof generation or transaction submission failed."}</span>
                    </div>
                )}

                {/* Confirmed Tx Details */}
                {progress.step === 'CONFIRMED' && progress.txHash && (
                    <div className="tx-details-box">
                        <div className="tx-row">
                            <span className="tx-label">Midnight Preprod Tx:</span>
                            <span className="tx-hash mono">{progress.txHash.slice(0, 16)}...{progress.txHash.slice(-8)}</span>
                        </div>
                        <div className="tx-row mt-2">
                            <span className="tx-label">Contract Address:</span>
                            <span className="tx-hash mono">{MIDNIGHT_CONFIG.contractAddress.slice(0, 8)}...{MIDNIGHT_CONFIG.contractAddress.slice(-4)}</span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-700/50 flex flex-wrap gap-2 justify-center">
                            <a
                                href={MIDNIGHT_CONFIG.explorerAccountUrl(MIDNIGHT_CONFIG.contractAddress)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                            >
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                1AM Block Explorer
                            </a>
                        </div>
                    </div>
                )}

                {/* Footer Action */}
                <div className="modal-footer">
                    {(progress.step === 'CONFIRMED' || progress.step === 'FAILED') ? (
                        <button className="primary-modal-btn" onClick={onClose}>
                            {progress.step === 'CONFIRMED' ? 'Done' : 'Try Again'}
                        </button>
                    ) : (
                        <div className="processing-hint">
                            <ShieldCheck className="w-4 h-4 mr-2 text-indigo-400" />
                            Please do not close this window while generating ZK proofs.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

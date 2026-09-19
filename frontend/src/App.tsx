import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ElectionCard } from './components/ElectionCard';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PrivacyExplainer } from './components/PrivacyExplainer';
import { TransactionModal } from './components/TransactionModal';
import { NotificationBanner } from './components/NotificationBanner';
import { useLaceWallet } from './hooks/useLaceWallet';
import { useMidnightContract } from './hooks/useMidnightContract';
import type { TransactionProgress, VoteReceipt, WalletState } from './types';

export const App: React.FC = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = (urlParams.get('tab') as 'vote' | 'results' | 'privacy') || 'vote';
    const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'privacy'>(initialTab);

    const {
        walletState: realWalletState,
        connectWallet,
        disconnectWallet,
        clearError: clearWalletError
    } = useLaceWallet();

    const {
        election,
        hasVoted: realHasVoted,
        lastReceipt: realLastReceipt,
        progress: realProgress,
        castPrivateVote,
        resetTransaction
    } = useMidnightContract(realWalletState.address);

    // Support URL param overrides for static screenshot captures
    const forceWallet = urlParams.get('wallet') === 'connected';
    const forceVoted = urlParams.get('voted') === 'true';
    const forceModal = urlParams.get('modal');

    const walletState: WalletState = forceWallet ? {
        isConnected: true,
        address: '02008f1c4e92a10d938bf347da0012c8a2b5349f71c4210e3a98db8591c20844',
        networkId: 'preprod',
        isConnecting: false,
        error: null
    } : realWalletState;

    const hasVoted = forceVoted || realHasVoted;
    const lastReceipt: VoteReceipt | null = forceVoted ? {
        electionId: election.id,
        nullifierHash: '3f8a92b0c144e8919db44821a7cd9018e622b109f7a801cc2839da47e091b642',
        timestamp: Date.now(),
        txId: '0x8f195608cc76115f98993287e5a6299c97aaf83d5323e74239de78f8823c0dac'
    } : realLastReceipt;

    const progress: TransactionProgress = forceModal ? {
        step: (forceModal as any) || 'COMPUTING_PROOF',
        txHash: forceModal === 'CONFIRMED' ? '0x8f195608cc76115f98993287e5a6299c97aaf83d5323e74239de78f8823c0dac' : undefined
    } : realProgress;

    const handleCastVote = (candidateId: number) => {
        castPrivateVote(candidateId);
    };

    return (
        <div className="app-container">
            {/* Navigation Header */}
            <Header
                walletState={walletState}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* Main Application Body */}
            <main className="main-content">
                {/* Global Error Banner */}
                <NotificationBanner
                    error={walletState.error}
                    onDismiss={clearWalletError}
                />

                {/* View 1: Active Election Ballot */}
                {activeTab === 'vote' && (
                    <ElectionCard
                        election={election}
                        walletState={walletState}
                        hasVoted={hasVoted}
                        lastReceipt={lastReceipt}
                        onCastVote={handleCastVote}
                        onConnectWallet={connectWallet}
                        onViewResults={() => setActiveTab('results')}
                    />
                )}

                {/* View 2: Public Results Dashboard */}
                {activeTab === 'results' && (
                    <ResultsDashboard
                        election={election}
                        onBackToVote={() => setActiveTab('vote')}
                    />
                )}

                {/* View 3: Privacy & Zero Knowledge Explainer */}
                {activeTab === 'privacy' && (
                    <PrivacyExplainer />
                )}
            </main>

            {/* ZK Proof & Transaction Modal */}
            <TransactionModal
                progress={progress}
                onClose={resetTransaction}
            />
        </div>
    );
};

export default App;

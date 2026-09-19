import React, { useState } from 'react';
import { Header } from './components/Header';
import { ElectionCard } from './components/ElectionCard';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PrivacyExplainer } from './components/PrivacyExplainer';
import { TransactionModal } from './components/TransactionModal';
import { NotificationBanner } from './components/NotificationBanner';
import { useLaceWallet } from './hooks/useLaceWallet';
import { useMidnightContract } from './hooks/useMidnightContract';

export const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'privacy'>('vote');

    const {
        walletState,
        connectWallet,
        disconnectWallet,
        clearError: clearWalletError
    } = useLaceWallet();

    const {
        election,
        hasVoted,
        lastReceipt,
        progress,
        castPrivateVote,
        resetTransaction
    } = useMidnightContract(walletState.address);

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

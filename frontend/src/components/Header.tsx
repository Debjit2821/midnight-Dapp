import React from 'react';
import type { WalletState } from '../types';
import { MIDNIGHT_CONFIG } from '../lib/midnightConfig';
import { ShieldCheck, Moon, Wallet, LogOut, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';

interface HeaderProps {
    walletState: WalletState;
    onConnect: () => void;
    onDisconnect: () => void;
    activeTab: 'vote' | 'results' | 'privacy';
    setActiveTab: (tab: 'vote' | 'results' | 'privacy') => void;
}

export const Header: React.FC<HeaderProps> = ({
    walletState,
    onConnect,
    onDisconnect,
    activeTab,
    setActiveTab
}) => {
    const shortenAddress = (addr: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <header className="header-container">
            <div className="header-content">
                {/* Brand Logo & Tagline */}
                <div className="brand-box" onClick={() => setActiveTab('vote')}>
                    <div className="logo-glow">
                        <Moon className="brand-moon-icon" />
                    </div>
                    <div>
                        <div className="brand-title">
                            SHADOW<span>VOTE</span>
                        </div>
                        <div className="brand-tagline">Vote privately. Verify publicly.</div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="nav-menu">
                    <button
                        className={`nav-link ${activeTab === 'vote' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vote')}
                    >
                        Active Election
                    </button>
                    <button
                        className={`nav-link ${activeTab === 'results' ? 'active' : ''}`}
                        onClick={() => setActiveTab('results')}
                    >
                        Public Results
                    </button>
                    <button
                        className={`nav-link ${activeTab === 'privacy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('privacy')}
                    >
                        About Privacy & ZK
                    </button>
                </nav>

                {/* Right controls: Network badge & Lace wallet button */}
                <div className="header-actions">
                    <a
                        href={MIDNIGHT_CONFIG.explorerAccountUrl(MIDNIGHT_CONFIG.contractAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="network-badge hover:border-indigo-500/50 transition-colors"
                        title={`Verified Midnight Preprod Contract: ${MIDNIGHT_CONFIG.contractAddress} (Click to open Explorer)`}
                    >
                        <span className="network-dot"></span>
                        <span>Midnight {MIDNIGHT_CONFIG.networkId.toUpperCase()}</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>

                    {walletState.isConnected && walletState.address ? (
                        <div className="wallet-connected-pill">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="address-text" title={walletState.address}>
                                {shortenAddress(walletState.address)}
                            </span>
                            <button
                                className="disconnect-btn"
                                onClick={onDisconnect}
                                title="Disconnect Lace Wallet"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="connect-wallet-btn"
                            onClick={onConnect}
                            disabled={walletState.isConnecting}
                        >
                            <Wallet className="w-4 h-4 mr-2" />
                            {walletState.isConnecting ? 'Connecting...' : 'Connect Lace'}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

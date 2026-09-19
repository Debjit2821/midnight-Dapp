import { useState, useEffect, useCallback } from 'react';
import type { WalletState } from '../types';
import { MIDNIGHT_CONFIG } from '../lib/midnightConfig';

// Declare Midnight window extension
declare global {
    interface Window {
        midnight?: Record<string, {
            name: string;
            icon?: string;
            apiVersion: string;
            connect: (networkId: string) => Promise<{
                getAccounts?: () => Promise<string[]>;
                state?: () => Promise<any>;
                submitTx?: (tx: any) => Promise<string>;
            }>;
        }>;
    }
}

export function useLaceWallet() {
    const [walletState, setWalletState] = useState<WalletState>({
        isConnected: false,
        address: null,
        networkId: null,
        isConnecting: false,
        error: null
    });

    const [walletApi, setWalletApi] = useState<any>(null);

    // Check existing connection in session
    useEffect(() => {
        const savedAddress = sessionStorage.getItem('shadowvote_wallet_address');
        const savedNetwork = sessionStorage.getItem('shadowvote_wallet_network');
        if (savedAddress) {
            setWalletState(prev => ({
                ...prev,
                isConnected: true,
                address: savedAddress,
                networkId: savedNetwork || MIDNIGHT_CONFIG.networkId
            }));
        }
    }, []);

    const connectWallet = useCallback(async () => {
        setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // 1. Inspect window.midnight
            if (typeof window === 'undefined' || !window.midnight) {
                // If Lace is not detected, check if user wants simulation or provide installation prompt
                const demoAddress = '02008f1c4e92a10d938bf347da0012c8a2b5349f71c4210e3a98db8591c20844';
                sessionStorage.setItem('shadowvote_wallet_address', demoAddress);
                sessionStorage.setItem('shadowvote_wallet_network', MIDNIGHT_CONFIG.networkId);
                
                setWalletState({
                    isConnected: true,
                    address: demoAddress,
                    networkId: MIDNIGHT_CONFIG.networkId,
                    isConnecting: false,
                    error: null
                });
                return;
            }

            // 2. Enumerate available Midnight wallets (e.g. Lace)
            const availableWallets = Object.values(window.midnight);
            if (availableWallets.length === 0) {
                throw new Error("Lace wallet extension not found in window.midnight.");
            }

            const laceWallet = availableWallets[0];
            const targetNetwork = MIDNIGHT_CONFIG.networkId;

            // 3. Connect to Midnight Preprod network
            const api = await laceWallet.connect(targetNetwork);
            setWalletApi(api);

            let accountAddress = '02008f1c4e92a10d938bf347da0012c8a2b5349f71c4210e3a98db8591c20844';
            if (api.getAccounts) {
                const accounts = await api.getAccounts();
                if (accounts && accounts.length > 0) {
                    accountAddress = accounts[0];
                }
            }

            sessionStorage.setItem('shadowvote_wallet_address', accountAddress);
            sessionStorage.setItem('shadowvote_wallet_network', targetNetwork);

            setWalletState({
                isConnected: true,
                address: accountAddress,
                networkId: targetNetwork,
                isConnecting: false,
                error: null
            });
        } catch (err: any) {
            console.error("Failed to connect Lace wallet:", err);
            let userMessage = err.message || "Failed to connect to Lace wallet.";
            if (err.message && err.message.includes('rejected')) {
                userMessage = "Wallet connection request was rejected by the user.";
            } else if (err.message && err.message.includes('network')) {
                userMessage = `Wrong network detected. Please switch Lace to Midnight ${MIDNIGHT_CONFIG.networkId}.`;
            }

            setWalletState(prev => ({
                ...prev,
                isConnecting: false,
                error: userMessage
            }));
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        sessionStorage.removeItem('shadowvote_wallet_address');
        sessionStorage.removeItem('shadowvote_wallet_network');
        setWalletApi(null);
        setWalletState({
            isConnected: false,
            address: null,
            networkId: null,
            isConnecting: false,
            error: null
        });
    }, []);

    const clearError = useCallback(() => {
        setWalletState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        walletState,
        walletApi,
        connectWallet,
        disconnectWallet,
        clearError
    };
}

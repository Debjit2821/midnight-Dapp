import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface NotificationBannerProps {
    error: string | null;
    onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ error, onDismiss }) => {
    if (!error) return null;

    const isWarning = error.includes('network') || error.includes('switch');

    return (
        <div className={`notification-banner ${isWarning ? 'warning' : 'error'}`}>
            <div className="banner-content">
                {isWarning ? (
                    <AlertTriangle className="banner-icon text-amber-400" />
                ) : (
                    <AlertCircle className="banner-icon text-rose-400" />
                )}
                <span className="banner-text">{error}</span>
            </div>
            <button className="banner-close" onClick={onDismiss}>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

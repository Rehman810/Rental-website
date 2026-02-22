import React, { useEffect, useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import './InstallPWA.css';

const InstallPWA = () => {
    const {
        isIOS,
        shouldShowPrompt,
        promptToInstall,
        dismissPrompt
    } = usePWAInstall();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Trigger mounting animation natively by giving it a frame
        if (shouldShowPrompt) {
            const frame = requestAnimationFrame(() => setMounted(true));
            return () => cancelAnimationFrame(frame);
        } else {
            setMounted(false);
        }
    }, [shouldShowPrompt]);

    if (!shouldShowPrompt && !mounted) return null;

    return (
        <div className={`pwa-bottom-sheet ${mounted && shouldShowPrompt ? 'visible' : ''}`}>
            <div className="pwa-sheet-content">
                <div className="pwa-info">
                    {/* Assuming the app has a 192x192 icon in PWA config or a logo in public directory */}
                    <img
                        src="/assets/pwa-192x192.png"
                        alt="App Icon"
                        className="pwa-icon"
                        onError={(e) => {
                            // Fallback if missing
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="pwa-text">
                        <h3>Add to Home Screen</h3>
                        <p>
                            {isIOS
                                ? "Tap the share icon below and select 'Add to Home Screen' for a faster, full-screen experience."
                                : "Install our app for a faster and seamless experience directly from your home screen."}
                        </p>
                    </div>
                </div>

                <div className="pwa-actions">
                    <button className="btn-dismiss" onClick={dismissPrompt} aria-label="Dismiss">
                        {isIOS ? "Close" : "Not Now"}
                    </button>

                    {!isIOS ? (
                        <button className="btn-install" onClick={promptToInstall} aria-label="Install App">
                            Install
                        </button>
                    ) : (
                        <div className="ios-share-hint" aria-label="Share Icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;

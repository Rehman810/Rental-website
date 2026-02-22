/**
 * @typedef {Object} PWAInstallState
 * @property {boolean} isMobile - True if the app is accessed on a mobile device.
 * @property {boolean} isIOS - True if the device is iOS.
 * @property {boolean} isStandalone - True if the app is already installed/running in standalone mode.
 * @property {boolean} shouldShowPrompt - True when conditions are met to show the custom prompt.
 * @property {Event|null} deferredPrompt - The intercepted beforeinstallprompt event.
 * @property {() => Promise<void>} promptToInstall - Function to trigger the native installation prompt.
 * @property {() => void} dismissPrompt - Function to dismiss the custom prompt and save to localStorage.
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook to manage PWA install prompt logic safely and cross-environment.
 * @returns {PWAInstallState} Custom hook state and actions.
 */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Evaluate user agent for responsiveness / mobile matching
        const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
        const mobileCheck = /android|ipad|playbook|silk/i.test(userAgent) || /iphone|ipod/i.test(userAgent) || /windows phone/i.test(userAgent) || /blackberry/i.test(userAgent) || /iemobile/i.test(userAgent);
        const iosCheck = /iphone|ipad|ipod/i.test(userAgent);

        setIsMobile(mobileCheck);
        setIsIOS(iosCheck);

        // Handle standalone (PWA already installed)
        const checkStandalone = () => {
            const isStandAloneMedia = window.matchMedia('(display-mode: standalone)').matches;
            // Native standard standalone check + iOS safari specific check
            return isStandAloneMedia || window.navigator.standalone === true;
        };
        setIsStandalone(checkStandalone());

        // Listen to display-mode change in case it installs while running
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleMediaQueryChange = (e) => setIsStandalone(e.matches);
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleMediaQueryChange);
        } else if (mediaQuery.addListener) {
            // Deprecated fallback for older browsers
            mediaQuery.addListener(handleMediaQueryChange);
        }

        // Check user dismissal state
        const dismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
        setIsDismissed(dismissed);

        // Event listener for successful installation
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setIsStandalone(true);
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        // Event listener to capture the prompt
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile natively
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        if (!iosCheck) {
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleMediaQueryChange);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(handleMediaQueryChange);
            }
            window.removeEventListener('appinstalled', handleAppInstalled);
            if (!iosCheck) {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            }
        };
    }, []);

    const dismissPrompt = () => {
        setIsDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    const promptToInstall = async () => {
        if (!deferredPrompt) return;

        // Show the native install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        // We've used the prompt, and can't use it again, clear it
        setDeferredPrompt(null);
    };

    // Calculate visibility
    // On Android, we need deferredPrompt to proceed securely. On iOS, we show the fallback modal without beforeinstallprompt natively supporting it.
    const shouldShowPrompt = isMobile && !isStandalone && !isDismissed && !isInstalled && ((!isIOS && deferredPrompt !== null) || isIOS);

    return {
        isMobile,
        isIOS,
        isStandalone,
        shouldShowPrompt,
        deferredPrompt,
        promptToInstall,
        dismissPrompt
    };
}

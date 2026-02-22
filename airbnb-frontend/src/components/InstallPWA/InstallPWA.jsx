import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = e => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = evt => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
        });
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                zIndex: 9999,
                padding: '10px 20px',
                backgroundColor: '#FF5A5F', // Airbnb primary
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontWeight: 'bold',
            }}
        >
            Install App
        </button>
    );
};

export default InstallPWA;

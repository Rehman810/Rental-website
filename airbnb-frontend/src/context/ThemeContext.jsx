import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 'light' | 'dark' | 'system'
    const [themeMode, setThemeMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState('light');

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);

        const updateTheme = () => {
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const newTheme = themeMode === 'system' ? systemPreference : themeMode;

            setResolvedTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);

            // Also sync body background for immediate effect to prevent white flash
            // (Though CSS variables handle this, redundancy helps)
        };

        updateTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (themeMode === 'system') {
                updateTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [themeMode]);

    const toggleTheme = (mode, persist = true) => {
        setThemeMode(mode);
        if (persist) {
            const token = localStorage.getItem('token');
            if (token) {
                // We don't await here to ensure instant UI feedback (optimistic update)
                // Errors should be handled silently or with a global toast consumer if needed
                import('../services/platformSettingsService.js').then(({ updatePlatformSettings }) => {
                    updatePlatformSettings({ appMode: mode }, token).catch(err => console.error("Failed to persist theme", err));
                });
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ themeMode, resolvedTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

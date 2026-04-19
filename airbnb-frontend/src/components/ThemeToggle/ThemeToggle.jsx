import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { resolvedTheme, toggleTheme } = useTheme();

    const handleToggle = () => {
        const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        toggleTheme(nextTheme);
    };

    return (
        <div className="theme-toggle-container">
            <button
                className="theme-toggle-btn"
                onClick={handleToggle}
                aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
            >
                <span className="theme-icon-current">
                    {resolvedTheme === 'light' ? <FiMoon /> : <FiSun />}
                </span>
            </button>
        </div>
    );
};

export default ThemeToggle;


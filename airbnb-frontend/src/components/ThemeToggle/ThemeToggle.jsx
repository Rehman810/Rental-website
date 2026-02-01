import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { themeMode, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = [
        { value: 'light', label: 'Light', icon: <FiSun /> },
        { value: 'dark', label: 'Dark', icon: <FiMoon /> },
        { value: 'system', label: 'System', icon: <FiMonitor /> },
    ];

    const currentOption = options.find(opt => opt.value === themeMode) || options[2];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="theme-toggle-container" ref={dropdownRef}>
            <button
                className="theme-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Switch Theme"
            >
                <span className="theme-icon-current">{currentOption.icon}</span>
            </button>

            {isOpen && (
                <div className="theme-dropdown">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`theme-option ${themeMode === option.value ? 'active' : ''}`}
                            onClick={() => {
                                toggleTheme(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <span className="theme-icon">{option.icon}</span>
                            <span className="theme-label">{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;

import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // 1. Strict Check: Only enable dark mode if explicitly saved as 'true'
        const saved = localStorage.getItem('darkMode');
        return saved === 'true'; // Defaults to false (Light Mode) if null
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // 2. Force apply the class based on state
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { APP_NAME } from '../config/env';

const TitleContext = createContext();

export const TitleProvider = ({ children }) => {
    // Stack of title objects: { id, title }
    const [titleStack, setTitleStack] = useState([]);

    // Helper to generate unique IDs
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const pushTitle = useCallback((title) => {
        const id = generateId();
        setTitleStack((prev) => [...prev, { id, title }]);
        return id;
    }, []);

    const popTitle = useCallback((id) => {
        setTitleStack((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const updateTitle = useCallback((id, newTitle) => {
        setTitleStack((prev) =>
            prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
        );
    }, []);

    useEffect(() => {
        const currentTitleEntry = titleStack[titleStack.length - 1];
        let newTitle = APP_NAME;

        if (currentTitleEntry && currentTitleEntry.title) {
            newTitle = `${currentTitleEntry.title} - ${APP_NAME}`;
        }

        document.title = newTitle;
    }, [titleStack]);

    return (
        <TitleContext.Provider value={{ pushTitle, popTitle, updateTitle }}>
            {children}
        </TitleContext.Provider>
    );
};

export const useTitleContext = () => useContext(TitleContext);

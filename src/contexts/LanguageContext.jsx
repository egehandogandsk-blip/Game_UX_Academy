import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translate } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

// Convenience hook: const t = useT(); then t('key')
export const useT = () => {
    const { language } = useLanguage();
    return (key) => translate(language, key);
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('gda-language') || 'tr';
    });

    useEffect(() => {
        localStorage.setItem('gda-language', language);
    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

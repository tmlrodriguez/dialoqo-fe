import { Fragment, createContext, useCallback, useEffect, useMemo, useState } from "react";

import {
    getStoredLanguage,
    translateText,
    LANGUAGE_STORAGE_KEY,
    SUPPORTED_LANGUAGES,
} from "../utils/i18n.js";
import { translateElementTree } from "../utils/translateElementTree.js";

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(getStoredLanguage);

    const setLanguage = useCallback((nextLanguage) => {
        const normalized = SUPPORTED_LANGUAGES.includes(nextLanguage) ? nextLanguage : "es";
        localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
        setLanguageState(normalized);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
        const root = document.getElementById("root");
        translateElementTree(root, language);
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "characterData")
                    translateElementTree(mutation.target.parentElement, language);
                for (const node of mutation.addedNodes)
                    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE)
                        translateElementTree(
                            node.nodeType === Node.TEXT_NODE ? node.parentElement : node,
                            language,
                        );
            }
        });
        if (root) observer.observe(root, { childList: true, subtree: true, characterData: true });
        return () => observer.disconnect();
    }, [language]);

    useEffect(() => {
        const originalConfirm = window.confirm;
        const originalAlert = window.alert;
        window.confirm = (message) => originalConfirm(translateText(String(message), language));
        window.alert = (message) => originalAlert(translateText(String(message), language));
        return () => {
            window.confirm = originalConfirm;
            window.alert = originalAlert;
        };
    }, [language]);

    const value = useMemo(
        () => ({
            language,
            setLanguage,
        }),
        [language, setLanguage],
    );

    return (
        <LanguageContext.Provider value={value}>
            <Fragment key={language}>{children}</Fragment>
        </LanguageContext.Provider>
    );
}

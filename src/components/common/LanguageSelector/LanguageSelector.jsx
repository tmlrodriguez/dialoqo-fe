import { useLanguage } from "../../../context/LanguageContext.jsx";

import styles from "./LanguageSelector.module.css";


function LanguageSelector({ compact = false, inverse = false }) {
    const { language, setLanguage } = useLanguage();

    return (
        <label className={`${styles.selector} ${compact ? styles.compact : ""} ${inverse ? styles.inverse : ""}`}>
            <span className={styles.srOnly}>
                {language === "en" ? "Language" : "Idioma"}
            </span>

            <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label={language === "en" ? "Language" : "Idioma"}
            >
                <option value="es">ES</option>
                <option value="en">EN</option>
            </select>
        </label>
    );
}


export default LanguageSelector;
import Page from "../../../components/common/layout/Page/Page.jsx";
import LegalHero from "../../../components/public/sections/LegalHero/LegalHero.jsx";
import LegalSectionList from "../../../components/public/lists/LegalSectionList/LegalSectionList.jsx";
import { CONTENT } from "../../../data/legalContent.js";
import { useLanguage } from "../../../hooks/useLanguage.js";

import styles from "./LegalPage.module.css";

function LegalPage({ type }) {
    const { language } = useLanguage();
    const localizedContent = CONTENT[type] || null;
    const currentLanguage = language === "en" ? "en" : "es";
    const copy = localizedContent ? localizedContent[currentLanguage] || localizedContent.es : null;

    if (!copy) {
        return null;
    }

    return (
        <Page title={copy.title}>
            <LegalHero copy={copy} />

            <article className={styles.content}>
                <LegalSectionList items={copy.sections} />
            </article>
        </Page>
    );
}

export default LegalPage;

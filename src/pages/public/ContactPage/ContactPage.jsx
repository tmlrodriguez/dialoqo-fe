import Page from "../../../components/common/layout/Page/Page.jsx";
import ContactDetails from "../../../components/public/sections/ContactDetails/ContactDetails.jsx";
import ContactHero from "../../../components/public/sections/ContactHero/ContactHero.jsx";
import { COPY } from "../../../data/contactContent.js";
import { useLanguage } from "../../../hooks/useLanguage.js";

import styles from "./ContactPage.module.css";

function ContactPage() {
    const { language } = useLanguage();
    const copy = COPY[language] || COPY.es;

    return (
        <Page title={copy.title} className={styles.contactPage}>
            <ContactHero copy={copy} />

            <ContactDetails copy={copy} />
        </Page>
    );
}

export default ContactPage;

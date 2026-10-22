import MessageContactList from "../../lists/MessageContactList/MessageContactList.jsx";

import UnsupportedContent from "../UnsupportedContent/UnsupportedContent.jsx";

import styles from "./ContactMessageContent.module.css";

/**
 * ContactMessageContent
 * Description: Render a structured WhatsApp message without performing requests.
 */

function ContactMessageContent({ contentData, t }) {
    let contacts = contentData.contacts;
    if (!Array.isArray(contacts)) {
        contacts = [contentData];
    }
    contacts = contacts.filter((contact) => contact && typeof contact === "object");
    if (contacts.length === 0) {
        return (
            <UnsupportedContent
                title={t("Contacto compartido")}
                description={t("No fue posible interpretar los datos del contacto.")}
            />
        );
    }
    return (
        <div className={styles.contacts}>
            <MessageContactList items={contacts} t={t} />
        </div>
    );
}

export default ContactMessageContent;

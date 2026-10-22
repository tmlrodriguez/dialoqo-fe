import ContactEmailList from "../ContactEmailList/ContactEmailList.jsx";

import ContactPhoneList from "../ContactPhoneList/ContactPhoneList.jsx";

import styles from "./MessageContactListItem.module.css";

/**
 * MessageContactListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function MessageContactListItem({ item: contact, index: index, t }) {
    const nameData = contact.name || {};
    const formattedName =
        typeof nameData === "string"
            ? nameData
            : nameData.formatted_name ||
              [nameData.first_name, nameData.middle_name, nameData.last_name]
                  .filter(Boolean)
                  .join(" ");
    const phones = Array.isArray(contact.phones) ? contact.phones : [];
    const emails = Array.isArray(contact.emails) ? contact.emails : [];
    return (
        <div className={styles.contactCard} key={`${formattedName || "contact"}-${index}`}>
            <div className={styles.contactAvatar}>
                {(formattedName || "C").charAt(0).toUpperCase()}
            </div>

            <div className={styles.contactInformation}>
                <strong>{formattedName || t("Contacto")}</strong>

                <ContactPhoneList items={phones} />

                <ContactEmailList items={emails} />
            </div>
        </div>
    );
}

export default MessageContactListItem;

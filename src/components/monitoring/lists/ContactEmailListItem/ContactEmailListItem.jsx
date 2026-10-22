/**
 * ContactEmailListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function ContactEmailListItem({ item: email, index: emailIndex }) {
    const emailValue = typeof email === "string" ? email : email.email || "";
    if (!emailValue) {
        return null;
    }
    return <small key={`${emailValue}-${emailIndex}`}>{emailValue}</small>;
}

export default ContactEmailListItem;

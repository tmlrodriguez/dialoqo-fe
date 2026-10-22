/**
 * ContactPhoneListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function ContactPhoneListItem({ item: phone, index: phoneIndex }) {
    const phoneValue =
        typeof phone === "string" ? phone : phone.phone || phone.wa_id || phone.number || "";
    if (!phoneValue) {
        return null;
    }
    return <span key={`${phoneValue}-${phoneIndex}`}>{phoneValue}</span>;
}

export default ContactPhoneListItem;

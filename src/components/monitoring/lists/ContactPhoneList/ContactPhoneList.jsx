import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import ContactPhoneListItem from "../ContactPhoneListItem/ContactPhoneListItem.jsx";

/**
 * ContactPhoneList
 * Description: Render the contact phone collection.
 */
function ContactPhoneList({
    items = [],
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((phone, phoneIndex) => (
        <ContactPhoneListItem key={phone?.id ?? phoneIndex} item={phone} index={phoneIndex} />
    ));
}

export default ContactPhoneList;

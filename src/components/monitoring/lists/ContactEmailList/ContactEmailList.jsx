import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import ContactEmailListItem from "../ContactEmailListItem/ContactEmailListItem.jsx";

/**
 * ContactEmailList
 * Description: Render the contact email collection.
 */
function ContactEmailList({
    items = [],
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((email, emailIndex) => (
        <ContactEmailListItem key={email?.id ?? emailIndex} item={email} index={emailIndex} />
    ));
}

export default ContactEmailList;

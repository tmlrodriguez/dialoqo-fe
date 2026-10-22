import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MessageContactListItem from "../MessageContactListItem/MessageContactListItem.jsx";

/**
 * MessageContactList
 * Description: Render the message contact collection.
 */
function MessageContactList({
    items = [],
    t,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((contact, index) => (
        <MessageContactListItem key={contact?.id ?? index} item={contact} index={index} t={t} />
    ));
}

export default MessageContactList;

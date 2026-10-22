import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MessageTimelineListItem from "../MessageTimelineListItem/MessageTimelineListItem.jsx";

/**
 * MessageTimelineList
 * Description: Render the message timeline collection.
 */
function MessageTimelineList({
    items = [],
    isDifferentDay,
    formatDateDivider,
    companyId,
    branchId,
    numberId,
    conversationId,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((message, index) => (
        <MessageTimelineListItem
            key={message.id}
            item={message}
            showDateDivider={isDifferentDay(message, items[index - 1])}
            formatDateDivider={formatDateDivider}
            companyId={companyId}
            branchId={branchId}
            numberId={numberId}
            conversationId={conversationId}
        />
    ));
}

export default MessageTimelineList;

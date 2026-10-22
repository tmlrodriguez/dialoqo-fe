import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MessageAttachmentListItem from "../MessageAttachmentListItem/MessageAttachmentListItem.jsx";

/**
 * MessageAttachmentList
 * Description: Render the message attachment collection.
 */
function MessageAttachmentList({
    items = [],
    companyId,
    branchId,
    numberId,
    conversationId,
    message,
    messageType,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((attachment) => (
        <MessageAttachmentListItem
            key={attachment.id}
            item={attachment}
            companyId={companyId}
            branchId={branchId}
            numberId={numberId}
            conversationId={conversationId}
            message={message}
            messageType={messageType}
        />
    ));
}

export default MessageAttachmentList;

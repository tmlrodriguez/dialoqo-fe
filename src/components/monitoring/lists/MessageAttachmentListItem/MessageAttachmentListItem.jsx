import MessageMedia from "../../media/MessageMedia/MessageMedia.jsx";

/**
 * MessageAttachmentListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function MessageAttachmentListItem({
    item: attachment,
    companyId,
    branchId,
    numberId,
    conversationId,
    message,
    messageType,
}) {
    return (
        <MessageMedia
            key={attachment.id}
            companyId={companyId}
            branchId={branchId}
            numberId={numberId}
            conversationId={conversationId}
            messageId={message.id}
            messageType={messageType}
            attachment={attachment}
        />
    );
}

export default MessageAttachmentListItem;

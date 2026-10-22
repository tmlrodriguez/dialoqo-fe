import MessageBubble from "../../content/MessageBubble/MessageBubble.jsx";

import styles from "./MessageTimelineListItem.module.css";

/**
 * MessageTimelineListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function MessageTimelineListItem({
    item: message,
    showDateDivider,
    formatDateDivider,
    companyId,
    branchId,
    numberId,
    conversationId,
}) {
    return (
        <div key={message.id}>
            {showDateDivider && (
                <div className={styles.dateDivider}>
                    <span>{formatDateDivider(message.message_timestamp)}</span>
                </div>
            )}

            <MessageBubble
                message={message}
                companyId={companyId}
                branchId={branchId}
                numberId={numberId}
                conversationId={conversationId}
            />
        </div>
    );
}

export default memo(MessageTimelineListItem);
import { memo } from "react";

import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import ConversationListItem from "../ConversationListItem/ConversationListItem.jsx";

/**
 * ConversationItemsList
 * Description: Render the conversation items collection.
 */
function ConversationItemsList({
    items = [],
    selectedConversationId,
    handleConversationClick,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((conversation) => (
        <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isSelected={String(selectedConversationId) === String(conversation.id)}
            onClick={handleConversationClick}
        />
    ));
}

export default ConversationItemsList;

import { memo } from "react";

import { useConversationList } from "../../../../hooks/useConversationList.js";
import ConversationListView from "../ConversationListView/ConversationListView.jsx";

/**
 * ConversationList
 * Description: Connect monitoring behavior to its presentation.
 */
function ConversationList(props) {
    const state = useConversationList(props);
    return <ConversationListView {...state} />;
}

export default memo(ConversationList);

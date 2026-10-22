import { memo } from "react";

import { useMessageList } from "../../../../hooks/useMessageList.js";
import MessageListView from "../MessageListView/MessageListView.jsx";

/**
 * MessageList
 * Description: Connect monitoring behavior to its presentation.
 */
function MessageList(props) {
    const state = useMessageList(props);
    return <MessageListView {...state} />;
}

export default memo(MessageList);

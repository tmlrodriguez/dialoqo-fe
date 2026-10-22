import { memo } from "react";

import { useMessageComposer } from "../../../../hooks/useMessageComposer.js";
import MessageComposerView from "../MessageComposerView/MessageComposerView.jsx";

/**
 * MessageComposer
 * Description: Connect monitoring behavior to its presentation.
 */
function MessageComposer(props) {
    const state = useMessageComposer(props);
    return <MessageComposerView {...state} />;
}

export default memo(MessageComposer);

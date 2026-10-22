import { useMessageMedia } from "../../../../hooks/useMessageMedia.js";
import MessageMediaView from "../MessageMediaView/MessageMediaView.jsx";

/**
 * MessageMedia
 * Description: Connect monitoring behavior to its presentation.
 */
function MessageMedia(props) {
    const state = useMessageMedia(props);
    return <MessageMediaView {...state} />;
}

export default MessageMedia;

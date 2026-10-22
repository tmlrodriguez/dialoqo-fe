import { useConversationPanel } from "../../../../hooks/useConversationPanel.js";
import ConversationPanelView from "../ConversationPanelView/ConversationPanelView.jsx";

/**
 * ConversationPanel
 * Description: Connect monitoring behavior to its presentation.
 */
function ConversationPanel(props) {
    const state = useConversationPanel(props);
    return <ConversationPanelView {...state} />;
}

export default ConversationPanel;

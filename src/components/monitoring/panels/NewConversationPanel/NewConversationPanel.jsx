import { useNewConversationPanel } from "../../../../hooks/useNewConversationPanel.js";
import NewConversationPanelView from "../NewConversationPanelView/NewConversationPanelView.jsx";

/**
 * NewConversationPanel
 * Description: Connect monitoring behavior to its presentation.
 */
function NewConversationPanel(props) {
    const state = useNewConversationPanel(props);
    return <NewConversationPanelView {...state} />;
}

export default NewConversationPanel;

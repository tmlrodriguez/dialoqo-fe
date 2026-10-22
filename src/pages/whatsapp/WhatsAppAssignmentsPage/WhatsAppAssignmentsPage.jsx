import Page from "../../../components/common/layout/Page/Page.jsx";
import WhatsAppAssignmentsView from "../../../components/whatsapp/sections/WhatsAppAssignmentsView/WhatsAppAssignmentsView.jsx";
import { useWhatsAppAssignments } from "../../../hooks/useWhatsAppAssignments.js";

import styles from "./WhatsAppAssignmentsPage.module.css";

/**
 * WhatsAppAssignmentsPage
 * Description: Orchestrate the company-scoped WhatsApp workspace.
 */
function WhatsAppAssignmentsPage(props) {
    const workspace = useWhatsAppAssignments(props);
    return (
        <Page as="div" title="WhatsApp" className={styles.assignmentSection}>
            <WhatsAppAssignmentsView {...workspace} />
        </Page>
    );
}

export default WhatsAppAssignmentsPage;

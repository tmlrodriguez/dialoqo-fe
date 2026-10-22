import Page from "../../../components/common/layout/Page/Page.jsx";
import WhatsAppTemplatesView from "../../../components/whatsapp/sections/WhatsAppTemplatesView/WhatsAppTemplatesView.jsx";
import { useWhatsAppTemplates } from "../../../hooks/useWhatsAppTemplates.js";

import styles from "./WhatsAppTemplatesPage.module.css";

/**
 * WhatsAppTemplatesPage
 * Description: Orchestrate the company-scoped WhatsApp workspace.
 */
function WhatsAppTemplatesPage(props) {
    const workspace = useWhatsAppTemplates(props);
    return (
        <Page as="div" title="WhatsApp" className={styles.templateSection}>
            <WhatsAppTemplatesView {...workspace} />
        </Page>
    );
}

export default WhatsAppTemplatesPage;

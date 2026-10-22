import Page from "../../../components/common/layout/Page/Page.jsx";
import WhatsAppAccountsView from "../../../components/whatsapp/sections/WhatsAppAccountsView/WhatsAppAccountsView.jsx";
import { useWhatsAppAccounts } from "../../../hooks/useWhatsAppAccounts.js";

import styles from "./WhatsAppAccountsPage.module.css";

/**
 * WhatsAppAccountsPage
 * Description: Orchestrate the company-scoped WhatsApp workspace.
 */
function WhatsAppAccountsPage(props) {
    const workspace = useWhatsAppAccounts(props);
    return (
        <Page as="div" title="WhatsApp" className={styles.wabaWorkspace}>
            <WhatsAppAccountsView {...workspace} />
        </Page>
    );
}

export default WhatsAppAccountsPage;

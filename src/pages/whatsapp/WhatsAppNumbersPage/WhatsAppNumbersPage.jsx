import Page from "../../../components/common/layout/Page/Page.jsx";
import WhatsAppNumbersView from "../../../components/whatsapp/sections/WhatsAppNumbersView/WhatsAppNumbersView.jsx";
import { useWhatsAppNumbers } from "../../../hooks/useWhatsAppNumbers.js";

import styles from "./WhatsAppNumbersPage.module.css";

/**
 * WhatsAppNumbersPage
 * Description: Orchestrate the company-scoped WhatsApp workspace.
 */
function WhatsAppNumbersPage(props) {
    const workspace = useWhatsAppNumbers(props);
    return (
        <Page as="div" title="WhatsApp" className={styles.numberSection}>
            <WhatsAppNumbersView {...workspace} />
        </Page>
    );
}

export default WhatsAppNumbersPage;

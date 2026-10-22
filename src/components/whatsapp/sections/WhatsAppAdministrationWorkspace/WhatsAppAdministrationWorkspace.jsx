import WhatsAppAccountsPage from "../../../../pages/whatsapp/WhatsAppAccountsPage/WhatsAppAccountsPage.jsx";
import WhatsAppAssignmentsPage from "../../../../pages/whatsapp/WhatsAppAssignmentsPage/WhatsAppAssignmentsPage.jsx";
import WhatsAppNumbersPage from "../../../../pages/whatsapp/WhatsAppNumbersPage/WhatsAppNumbersPage.jsx";
import WhatsAppTemplatesPage from "../../../../pages/whatsapp/WhatsAppTemplatesPage/WhatsAppTemplatesPage.jsx";

import styles from "./WhatsAppAdministrationWorkspace.module.css";

/**
 * WhatsAppAdministrationWorkspace
 * Description: Present a page section with explicit data and action props.
 */
function WhatsAppAdministrationWorkspace({
    isLoadingCompanies,
    t,
    hasSelectedCompany,
    activeSection,
    contextKey,
    selectedCompanyId,
    contextHandlers,
}) {
    return isLoadingCompanies ? (
        <section className={styles.emptyWorkspace}>
            <strong>{t("Cargando empresas...")}</strong>
        </section>
    ) : !hasSelectedCompany ? (
        /* EMPTY COMPANY STATE                        */

        <section className={styles.emptyWorkspace}>
            <div className={styles.emptyIcon}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />

                    <path d="M17 9h2a1 1 0 0 1 1 1v11" />

                    <path d="M2 21h20" />
                </svg>
            </div>

            <strong>{t("No existe una empresa seleccionada.")}</strong>

            <span>{t("Cree o seleccione una empresa antes de configurar WhatsApp.")}</span>
        </section>
    ) : (
        /* COMPANY WHATSAPP WORKSPACE                 */

        <>
            {activeSection === "accounts" && (
                <WhatsAppAccountsPage
                    key={contextKey}
                    companyId={selectedCompanyId}
                    {...contextHandlers}
                />
            )}

            {activeSection === "numbers" && (
                <WhatsAppNumbersPage
                    key={contextKey}
                    companyId={selectedCompanyId}
                    {...contextHandlers}
                />
            )}

            {activeSection === "assignments" && (
                <WhatsAppAssignmentsPage
                    key={contextKey}
                    companyId={selectedCompanyId}
                    {...contextHandlers}
                />
            )}

            {activeSection === "templates" && (
                <WhatsAppTemplatesPage
                    key={contextKey}
                    companyId={selectedCompanyId}
                    {...contextHandlers}
                />
            )}
        </>
    );
}

export default WhatsAppAdministrationWorkspace;

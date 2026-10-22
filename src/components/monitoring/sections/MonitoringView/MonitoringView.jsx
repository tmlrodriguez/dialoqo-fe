import MonitoringSelection from "../MonitoringSelection/MonitoringSelection.jsx";

import MonitoringWorkspace from "../MonitoringWorkspace/MonitoringWorkspace.jsx";

import styles from "./MonitoringView.module.css";

/**
 * MonitoringView
 * Description: Present the loadingworkspace section with page-owned data and actions.
 */
function MonitoringView({
    isLoadingContext,
    t,
    companies,
    isMember,
    monitoringStep,
    selectedCompany,
    selectedBranch,
    selectedNumber,
    canSendMessages,
    canStartConversations,
    canChangeNumber,
    handleChangeNumber,
    setErrorMessage,
    handleCompanySelect,
    handleBranchSelect,
    handleNumberSelect,
    handleSelectionBack,
}) {
    return isLoadingContext ? (
        <section className={styles.loadingWorkspace}>
            <div className={styles.loadingIndicator}>
                <span></span>
            </div>

            <strong>{t("Cargando contexto de conversaciones...")}</strong>
            <span>{t("Estamos obteniendo los canales autorizados para su usuario.")}</span>
        </section>
    ) : companies.length === 0 ? (
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

            <strong>{t("No existen conversaciones disponibles.")}</strong>
            <span>
                {isMember
                    ? t("Su usuario todavía no tiene ningún número de WhatsApp asignado.")
                    : t(
                          "Su usuario todavía no tiene acceso a empresas con canales de monitoreo disponibles.",
                      )}
            </span>
        </section>
    ) : monitoringStep === "workspace" && selectedCompany && selectedBranch && selectedNumber ? (
        <MonitoringWorkspace
            key={`${selectedCompany.id}:${selectedBranch.id}:${selectedNumber.id}`}
            company={selectedCompany}
            branch={selectedBranch}
            number={selectedNumber}
            canSendMessages={canSendMessages}
            canStartConversations={canStartConversations}
            onChangeNumber={canChangeNumber ? handleChangeNumber : null}
            onError={setErrorMessage}
        />
    ) : (
        <MonitoringSelection
            step={monitoringStep}
            companies={companies}
            selectedCompany={selectedCompany}
            selectedBranch={selectedBranch}
            onCompanySelect={handleCompanySelect}
            onBranchSelect={handleBranchSelect}
            onNumberSelect={handleNumberSelect}
            onBack={handleSelectionBack}
        />
    );
}

export default MonitoringView;

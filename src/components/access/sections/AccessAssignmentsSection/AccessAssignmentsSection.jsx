import EmptyState from "../../../common/feedback/EmptyState/EmptyState.jsx";
import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import AccessHistoryList from "../../lists/AccessHistoryList/AccessHistoryList.jsx";

import ActiveAccessList from "../../lists/ActiveAccessList/ActiveAccessList.jsx";
import CompanyAccessForm from "../../forms/CompanyAccessForm/CompanyAccessForm.jsx";

import styles from "./AccessAssignmentsSection.module.css";

/**
 * AccessAssignmentsSection
 * Description: Present the accessworkspace section with page-owned data and actions.
 */
function AccessAssignmentsSection({
    activeSection,
    accessMonitorId,
    accessCompanyId,
    monitors,
    companies,
    isSaving,
    isLoadingMonitors,
    isLoadingCompanies,
    setAccessMonitorId,
    setAccessCompanyId,
    handleGrantAccess,
    t,
    isLoadingAccesses,
    activeAccesses,
    handleRevokeAccess,
    isDeleting,
    historicalAccesses,
}) {
    return (
        activeSection === "accesses" && (
            <div className={styles.accessWorkspace}>
                <CompanyAccessForm
                    monitorId={accessMonitorId}
                    companyId={accessCompanyId}
                    monitors={monitors}
                    companies={companies}
                    isSaving={isSaving}
                    isLoadingMonitors={isLoadingMonitors}
                    isLoadingCompanies={isLoadingCompanies}
                    onMonitorChange={(event) => setAccessMonitorId(event.target.value)}
                    onCompanyChange={(event) => setAccessCompanyId(event.target.value)}
                    onSubmit={handleGrantAccess}
                />

                <section className={styles.listPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>{t("Accesos de Monitores activos")}</h2>
                            <p>
                                {t(
                                    "Empresas que cada usuario MONITOR tiene autorizadas para supervisión.",
                                )}
                            </p>
                        </div>
                    </div>

                    {isLoadingAccesses ? (
                        <LoadingState message={t("Cargando accesos...")} />
                    ) : activeAccesses.length === 0 ? (
                        <EmptyState
                            icon="✓"
                            title={t("No existen accesos activos.")}
                            description={t("Asigne una empresa a un monitor para comenzar.")}
                        />
                    ) : (
                        <div className={styles.accessList}>
                            <ActiveAccessList
                                items={activeAccesses}
                                t={t}
                                handleRevokeAccess={handleRevokeAccess}
                                isDeleting={isDeleting}
                            />
                        </div>
                    )}
                </section>

                {historicalAccesses.length > 0 && (
                    <section className={styles.historyPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Historial de Accesos de Monitores")}</h2>
                                <p>{t("Accesos que fueron revocados anteriormente.")}</p>
                            </div>
                        </div>

                        <div className={styles.accessList}>
                            <AccessHistoryList items={historicalAccesses} t={t} />
                        </div>
                    </section>
                )}
            </div>
        )
    );
}

export default AccessAssignmentsSection;

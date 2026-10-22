import Button from "../../../common/buttons/Button/Button.jsx";
import EmptyState from "../../../common/feedback/EmptyState/EmptyState.jsx";
import EntityList from "../../../common/lists/EntityList/EntityList.jsx";
import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MonitorForm from "../../forms/MonitorForm/MonitorForm.jsx";

import MonitorList from "../../lists/MonitorList/MonitorList.jsx";

import styles from "./AccessMonitorsSection.module.css";

/**
 * AccessMonitorsSection
 * Description: Present a page section with explicit data and action props.
 */
function AccessMonitorsSection({
    activeSection,
    t,
    resetMonitorForm,
    isLoadingMonitors,
    monitors,
    selectedMonitor,
    isLoadingMonitorDetail,
    handleSelectMonitor,
    monitorFormVersion,
    isSaving,
    isDeleting,
    handleMonitorSubmit,
    handleDeactivateMonitor,
}) {
    return (
        activeSection === "monitors" && (
            <div className={styles.workspace}>
                <section className={styles.listPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>{t("Monitores")}</h2>
                            <p>
                                {t(
                                    "Usuarios autorizados para utilizar las funciones de monitoreo.",
                                )}
                            </p>
                        </div>

                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={resetMonitorForm}
                        >
                            {t("Nuevo monitor")}
                        </Button>
                    </div>

                    {isLoadingMonitors ? (
                        <LoadingState message={t("Cargando monitores...")} />
                    ) : monitors.length === 0 ? (
                        <EmptyState
                            icon="●"
                            title={t("No existen monitores registrados.")}
                            description={t(
                                "Cree el primer monitor para posteriormente asignarle acceso a empresas.",
                            )}
                        />
                    ) : (
                        <EntityList>
                            <MonitorList
                                items={monitors}
                                t={t}
                                selectedMonitor={selectedMonitor}
                                isLoadingMonitorDetail={isLoadingMonitorDetail}
                                handleSelectMonitor={handleSelectMonitor}
                            />
                        </EntityList>
                    )}
                </section>

                <MonitorForm
                    key={monitorFormVersion}
                    selectedMonitor={selectedMonitor}

                    isSaving={isSaving}
                    isDeleting={isDeleting}
                    isLoadingDetail={isLoadingMonitorDetail}

                    onSubmit={handleMonitorSubmit}
                    onReset={resetMonitorForm}
                    onDeactivate={handleDeactivateMonitor}
                />
            </div>
        )
    );
}

export default AccessMonitorsSection;

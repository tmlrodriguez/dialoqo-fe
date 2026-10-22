import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./MonitoringResourceListItem.module.css";

/**
 * MonitoringResourceListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function MonitoringResourceListItem({
    item: item,
    step,
    getNumberAssignmentMember,
    handleItemClick,
    getCardInitial,
    getCardTitle,
    getCardSubtitle,
    t,
    getMemberName,
}) {
    const assignedMember = step === "number" ? getNumberAssignmentMember(item) : null;
    return (
        <Button
            key={item.id}
            className={styles.card}
            type="button"
            onClick={() => handleItemClick(item)}
        >
            <div className={styles.cardIcon}>{getCardInitial(item)}</div>

            <div className={styles.cardContent}>
                <strong>{getCardTitle(item)}</strong>
                <span>{getCardSubtitle(item)}</span>

                {step === "number" && (
                    <div className={styles.assignmentInformation}>
                        <span className={styles.assignmentLabel}>{t("Responsable")}</span>
                        <strong
                            className={
                                assignedMember ? styles.assignmentName : styles.unassignedName
                            }
                        >
                            {getMemberName(assignedMember)}
                        </strong>
                    </div>
                )}
            </div>

            {step === "number" && (
                <div className={styles.numberStatuses}>
                    {item.is_connected && (
                        <span className={styles.connectedBadge}>{t("Conectado")}</span>
                    )}
                    {item.is_monitoring_enabled && (
                        <span className={styles.monitoringBadge}>{t("Monitoreando")}</span>
                    )}
                </div>
            )}

            <svg
                className={styles.chevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="m9 18 6-6-6-6" />
            </svg>
        </Button>
    );
}

export default MonitoringResourceListItem;

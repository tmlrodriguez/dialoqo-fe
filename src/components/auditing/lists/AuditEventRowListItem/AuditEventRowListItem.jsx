import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./AuditEventRowListItem.module.css";

/**
 * AuditEventRowListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function AuditEventRowListItem({
    item: event,
    selectedEventId,
    onSelectEvent,
    t,
    CATEGORY_LABELS,
    ACTION_LABELS,
    SEVERITY_LABELS,
    formatDateTime,
    getActorLabel,
    getTargetLabel,
}) {
    const isSelected = selectedEventId === event.id;
    return (
        <Button
            key={event.id}
            className={`${styles.eventCard} ${isSelected ? styles.eventCardActive : ""}`}
            type="button"
            onClick={() => onSelectEvent(event)}
        >
            <div className={styles.eventTopRow}>
                <div className={styles.eventBadges}>
                    <span className={styles.categoryBadge}>
                        {t(CATEGORY_LABELS[event.category] || event.category)}
                    </span>

                    <span className={styles.actionBadge}>
                        {t(ACTION_LABELS[event.action] || event.action)}
                    </span>

                    <span
                        className={`${styles.severityBadge} ${event.severity === "CRITICAL" ? styles.severityCritical : event.severity === "WARNING" ? styles.severityWarning : styles.severityInfo}`}
                    >
                        {t(SEVERITY_LABELS[event.severity] || event.severity)}
                    </span>
                </div>

                <span className={styles.eventDate}>{formatDateTime(event.occurred_at)}</span>
            </div>

            <div className={styles.eventDescription}>{event.description}</div>

            <div className={styles.eventMetadata}>
                <div className={styles.metadataItem}>
                    <span>{t("Actor")}</span>
                    <strong>{getActorLabel(event.actor)}</strong>
                </div>

                <div className={styles.metadataItem}>
                    <span>{t("Recurso")}</span>
                    <strong>{getTargetLabel(event)}</strong>
                </div>

                {event.branch && (
                    <div className={styles.metadataItem}>
                        <span>{t("Sucursal")}</span>
                        <strong>{event.branch.name}</strong>
                    </div>
                )}
            </div>
        </Button>
    );
}

export default AuditEventRowListItem;

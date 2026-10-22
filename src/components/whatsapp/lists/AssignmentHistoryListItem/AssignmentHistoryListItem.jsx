import styles from "./AssignmentHistoryListItem.module.css";

/**
 * AssignmentHistoryListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function AssignmentHistoryListItem({
    item: assignment,
    getMemberName,
    getMemberDescription,
    t,
    formatDateTime,
}) {
    return (
        <article key={assignment.id} className={styles.historyCard}>
            <div className={styles.historyMain}>
                <div
                    className={
                        assignment.is_active ? styles.historyAvatarActive : styles.historyAvatar
                    }
                >
                    {(assignment.member?.first_name || assignment.member?.username || "M")
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div className={styles.historyInformation}>
                    <strong>{getMemberName(assignment.member)}</strong>

                    <span>{getMemberDescription(assignment.member) || t("Miembro")}</span>
                </div>
            </div>

            <div className={styles.historyDates}>
                <span>{formatDateTime(assignment.assigned_at)}</span>

                <span>
                    {assignment.is_active
                        ? t("Actual")
                        : `${t("Hasta el")} ${formatDateTime(assignment.unassigned_at)}`}
                </span>
            </div>

            <span className={assignment.is_active ? styles.activeBadge : styles.inactiveBadge}>
                {assignment.is_active ? t("Activa") : t("Finalizada")}
            </span>
        </article>
    );
}

export default AssignmentHistoryListItem;

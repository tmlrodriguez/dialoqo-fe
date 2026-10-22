import styles from "./AccessHistoryListItem.module.css";

/**
 * AccessHistoryListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function AccessHistoryListItem({ item: access, t }) {
    const monitorName =
        [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") ||
        access.user?.username;
    return (
        <div key={access.id} className={styles.accessCard}>
            <div className={styles.accessInformation}>
                <div className={styles.accessAvatarMuted}>
                    {(access.user?.first_name || access.user?.username || "M")
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div>
                    <strong>{monitorName}</strong>
                    <span>{access.company?.name}</span>
                </div>
            </div>

            <span className={styles.inactiveBadge}>{t("Revocado")}</span>
        </div>
    );
}

export default AccessHistoryListItem;

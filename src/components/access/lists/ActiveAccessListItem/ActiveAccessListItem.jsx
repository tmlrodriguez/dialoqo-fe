import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./ActiveAccessListItem.module.css";

/**
 * ActiveAccessListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function ActiveAccessListItem({ item: access, t, handleRevokeAccess, isDeleting }) {
    const monitorName =
        [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") ||
        access.user?.username;
    return (
        <div key={access.id} className={styles.accessCard}>
            <div className={styles.accessInformation}>
                <div className={styles.accessAvatar}>
                    {(access.user?.first_name || access.user?.username || "M")
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div>
                    <strong>{monitorName}</strong>
                    <span>{access.company?.name}</span>
                </div>
            </div>

            <div className={styles.accessActions}>
                <span className={styles.statusBadge}>{t("Activo")}</span>

                <Button
                    className={styles.dangerButtonSmall}
                    type="button"
                    onClick={() => handleRevokeAccess(access)}
                    disabled={isDeleting}
                >
                    {t("Revocar")}
                </Button>
            </div>
        </div>
    );
}

export default ActiveAccessListItem;

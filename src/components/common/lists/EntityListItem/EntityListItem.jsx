import Button from "../../buttons/Button/Button.jsx";

import styles from "./EntityListItem.module.css";

/**
 * EntityListItem
 *
 * Description:
 * - Mostrar una entidad seleccionable dentro de una lista.
 *
 * Notes:
 * - Permite mostrar título, subtítulo, inicial y estado.
 */
function EntityListItem({
    title,
    subtitle,
    initial,
    status,
    isActive = false,
    disabled = false,
    onClick,
}) {
    return (
        <Button
            className={`${styles.entityItem} ${isActive ? styles.entityItemActive : ""}`}
            type="button"
            onClick={onClick}
            disabled={disabled}
        >
            <div className={styles.entityMain}>
                <div className={styles.entityAvatar}>{initial}</div>

                <div className={styles.entityInformation}>
                    <strong>{title}</strong>

                    {subtitle && <span>{subtitle}</span>}
                </div>
            </div>

            {status && <span className={styles.statusBadge}>{status}</span>}
        </Button>
    );
}

export default EntityListItem;

import styles from "./EmptyState.module.css";

/**
 * EmptyState
 *
 * Description:
 * - Mostrar información cuando una sección no contiene registros.
 *
 * Notes:
 * - Permite mostrar un icono y una acción opcional.
 */
function EmptyState({ icon = "○", title, description, action = null }) {
    return (
        <div className={styles.emptyState}>
            <div className={styles.icon}>{icon}</div>

            <strong>{title}</strong>

            {description && <span>{description}</span>}

            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
}

export default EmptyState;

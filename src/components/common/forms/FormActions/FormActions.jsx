import styles from "./FormActions.module.css";

/**
 * FormActions
 *
 * Description:
 * - Organizar las acciones disponibles al final de un formulario.
 *
 * Notes:
 * - Permite separar acciones destructivas de las acciones principales.
 */
function FormActions({ destructive = null, children }) {
    return (
        <div className={styles.formActions}>
            <div className={styles.destructive}>{destructive}</div>

            <div className={styles.primaryActions}>{children}</div>
        </div>
    );
}

export default FormActions;

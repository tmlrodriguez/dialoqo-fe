import styles from "./AlertMessage.module.css";

/**
 * AlertMessage
 *
 * Description:
 * - Mostrar mensajes informativos, exitosos o de error.
 *
 * Notes:
 * - No renderiza contenido cuando el mensaje está vacío.
 */
function AlertMessage({ message, type = "error" }) {
    if (!message) {
        return null;
    }

    const className = `${styles.alert} ${styles[type] || styles.error}`;

    return (
        <div className={className} role={type === "error" ? "alert" : "status"}>
            {message}
        </div>
    );
}

export default AlertMessage;

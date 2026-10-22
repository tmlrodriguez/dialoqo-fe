import Spinner from "../Spinner/Spinner.jsx";

import styles from "./LoadingState.module.css";

/**
 * LoadingState
 *
 * Description:
 * - Mostrar un estado de carga reutilizable.
 *
 * Notes:
 * - El mensaje puede personalizarse según la operación.
 */
function LoadingState({ message = "Cargando..." }) {
    return (
        <div className={styles.loadingState}>
            <Spinner as="div" className={styles.spinner} />

            <span>{message}</span>
        </div>
    );
}

export default LoadingState;

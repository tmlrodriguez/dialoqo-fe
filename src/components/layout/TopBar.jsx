import LanguageSelector from "../common/LanguageSelector/LanguageSelector.jsx";
import styles from "./AppLayout.module.css";


/**
 * TopBar
 *
 * Description:
 * - Renderizar la barra superior del área autenticada.
 *
 * Notes:
 * - Muestra la identidad de Dialoqo, el usuario autenticado y la acción de cerrar sesión.
 */
function TopBar({
    userName,
    handleLogout,
}) {
    return (
        <header className={styles.topbar}>
            <span className={styles.topbarApplication}>
                Dialoqo · Inteligencia conversacional
            </span>

            <div className={styles.topbarActions}>
                <LanguageSelector compact />
                <div className={styles.topbarUser}>
                    <span className={styles.topbarUserName}>
                        {userName}
                    </span>
                </div>

                <button
                    className={styles.logoutButton}
                    type="button"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>
            </div>
        </header>
    );
}

export default TopBar;
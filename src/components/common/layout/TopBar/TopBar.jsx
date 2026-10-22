import Button from "../../buttons/Button/Button.jsx";
import LanguageSelector from "../../navigation/LanguageSelector/LanguageSelector.jsx";

import styles from "./TopBar.module.css";

/**
 * TopBar
 *
 * Description:
 * - Renderizar la barra superior del área autenticada.
 *
 * Notes:
 * - Muestra la identidad de Dialoqo, el usuario autenticado y la acción de cerrar sesión.
 */
function TopBar({ userName, handleLogout }) {
    return (
        <header className={styles.topbar}>
            <span className={styles.topbarApplication}>Dialoqo · Centro de mensajería empresarial</span>

            <div className={styles.topbarActions}>
                <LanguageSelector compact />
                <div className={styles.topbarUser}>
                    <span className={styles.topbarUserName}>{userName}</span>
                </div>

                <Button className={styles.logoutButton} type="button" onClick={handleLogout}>
                    Cerrar sesión
                </Button>
            </div>
        </header>
    );
}

export default TopBar;

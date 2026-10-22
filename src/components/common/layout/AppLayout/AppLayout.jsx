import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import dialoqoLogo from "../../../../assets/dialoqo-logo.png";
import { useAuth } from "../../../../hooks/useAuth.js";
import Button from "../../buttons/Button/Button.jsx";
import SideBar from "../SideBar/SideBar.jsx";
import TopBar from "../TopBar/TopBar.jsx";

import styles from "./AppLayout.module.css";

/**
 * AppLayout
 *
 * Description:
 * - Proporcionar la estructura principal de la aplicación autenticada.
 *
 * Notes:
 * - Coordina la navegación lateral, barra superior y menú móvil.
 */
function AppLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const userName =
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username;

    /**
     * handleLogout
     *
     * Description:
     * - Cerrar la sesión activa y regresar al inicio de sesión.
     */
    async function handleLogout() {
        setIsMobileMenuOpen(false);

        try {
            await logout();
        } catch {
            // AuthContext has already cleared the local session after a failed logout.
        }

        navigate("/login", {
            replace: true,
        });
    }

    /**
     * toggleMobileMenu
     *
     * Description:
     * - Alternar la visibilidad del menú móvil.
     */
    function toggleMobileMenu() {
        setIsMobileMenuOpen((currentValue) => !currentValue);
    }

    /**
     * closeMobileMenu
     *
     * Description:
     * - Cerrar el menú móvil.
     */
    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }

    return (
        <div className={styles.appLayout}>
            <header className={styles.mobileHeader}>
                <Button
                    className={styles.mobileMenuButton}
                    type="button"
                    onClick={toggleMobileMenu}
                    aria-label="Abrir menú"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </Button>

                <div className={styles.mobileBrand}>
                    <div className={styles.mobileBrandLogoWrap}>
                        <img src={dialoqoLogo} alt="Dialoqo" className={styles.mobileBrandLogo} />
                    </div>

                    <span>Dialoqo</span>
                </div>
            </header>

            {isMobileMenuOpen && (
                <Button
                    className={styles.mobileOverlay}
                    type="button"
                    aria-label="Cerrar menú"
                    onClick={closeMobileMenu}
                />
            )}

            <SideBar
                user={user}
                userName={userName}
                isMobileMenuOpen={isMobileMenuOpen}
                closeMobileMenu={closeMobileMenu}
                handleLogout={handleLogout}
            />

            <div className={styles.mainArea}>
                <TopBar userName={userName} handleLogout={handleLogout} />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;

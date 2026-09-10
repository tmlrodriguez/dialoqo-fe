import { NavLink } from "react-router-dom";

import dialoqoLogo from "../../assets/dialoqo-logo.png";

import styles from "./AppLayout.module.css";


/**
 * SideBar
 *
 * Description:
 * - Renderizar la navegación principal de Dialoqo.
 *
 * Notes:
 * - Las opciones visibles dependen del rol del usuario.
 * - Los MONITOR acceden exclusivamente al área de conversaciones.
 * - Los ADMINISTRATOR acceden exclusivamente a las funciones administrativas y de auditoría.
 * - Soporta navegación lateral en escritorio y menú móvil.
 * - Todos los iconos utilizan SVG con dimensiones y estilo consistentes.
 */
function SideBar({
    user,
    userName,
    isMobileMenuOpen,
    closeMobileMenu,
    handleLogout,
}) {
    const isAdministrator =
        user?.role === "ADMINISTRATOR";

    const isMonitor =
        user?.role === "MONITOR";

    return (
        <aside
            className={`${styles.sidebar} ${
                isMobileMenuOpen
                    ? styles.sidebarOpen
                    : ""
            }`}
        >
            <div className={styles.sidebarHeader}>
                <div className={styles.brand}>
                    <div className={styles.brandLogoWrap}>
                        <img
                            src={dialoqoLogo}
                            alt="Dialoqo"
                            className={styles.brandLogo}
                        />
                    </div>

                    <div className={styles.brandContent}>
                        <span className={styles.brandName}>
                            Dialoqo
                        </span>

                        <span className={styles.brandDescription}>
                            Inteligencia conversacional
                        </span>
                    </div>
                </div>

                <button
                    className={styles.mobileCloseButton}
                    type="button"
                    onClick={closeMobileMenu}
                    aria-label="Cerrar menú"
                >
                    ×
                </button>
            </div>

            <nav className={styles.navigation}>
                {isMonitor && (
                    <>
                        <span className={styles.navigationTitle}>
                            Principal
                        </span>

                        <NavLink
                            to="/app"
                            end
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `${styles.navigationItem} ${
                                    isActive
                                        ? styles.navigationItemActive
                                        : ""
                                }`
                            }
                        >
                            <span className={styles.navigationIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="7"
                                        height="7"
                                        rx="1"
                                    />

                                    <rect
                                        x="14"
                                        y="3"
                                        width="7"
                                        height="7"
                                        rx="1"
                                    />

                                    <rect
                                        x="3"
                                        y="14"
                                        width="7"
                                        height="7"
                                        rx="1"
                                    />

                                    <rect
                                        x="14"
                                        y="14"
                                        width="7"
                                        height="7"
                                        rx="1"
                                    />
                                </svg>
                            </span>

                            <span>
                                Dashboard
                            </span>
                        </NavLink>

                        <NavLink
                            to="/app/monitoring"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `${styles.navigationItem} ${
                                    isActive
                                        ? styles.navigationItemActive
                                        : ""
                                }`
                            }
                        >
                            <span className={styles.navigationIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="3"
                                    />

                                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                                </svg>
                            </span>

                            <span>
                                Conversaciones
                            </span>
                        </NavLink>
                    </>
                )}

                {isAdministrator && (
                    <>
                        <span className={styles.navigationTitle}>
                            Administración
                        </span>

                        <NavLink
                            to="/app/administration/organization"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `${styles.navigationItem} ${
                                    isActive
                                        ? styles.navigationItemActive
                                        : ""
                                }`
                            }
                        >
                            <span className={styles.navigationIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M3 21h18" />
                                    <path d="M5 21V6l7-3 7 3v15" />
                                    <path d="M9 9h2" />
                                    <path d="M13 9h2" />
                                    <path d="M9 13h2" />
                                    <path d="M13 13h2" />
                                    <path d="M10 21v-4h4v4" />
                                </svg>
                            </span>

                            <span>
                                Organización
                            </span>
                        </NavLink>

                        <NavLink
                            to="/app/administration/members"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `${styles.navigationItem} ${
                                    isActive
                                        ? styles.navigationItemActive
                                        : ""
                                }`
                            }
                        >
                            <span className={styles.navigationIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="9"
                                        cy="8"
                                        r="3"
                                    />

                                    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />

                                    <circle
                                        cx="17"
                                        cy="9"
                                        r="2.5"
                                    />

                                    <path d="M15.5 14.5A4.5 4.5 0 0 1 21 19" />
                                </svg>
                            </span>

                            <span>
                                Personal
                            </span>
                        </NavLink>

                        <NavLink
                            to="/app/administration/access"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `${styles.navigationItem} ${
                                    isActive
                                        ? styles.navigationItemActive
                                        : ""
                                }`
                            }
                        >
                            <span className={styles.navigationIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="8"
                                        cy="8"
                                        r="3"
                                    />

                                    <path d="M3 19a5 5 0 0 1 10 0" />

                                    <rect
                                        x="14"
                                        y="12"
                                        width="7"
                                        height="7"
                                        rx="1.5"
                                    />

                                    <path d="M16 12V9.5a1.5 1.5 0 0 1 3 0V12" />
                                </svg>
                            </span>

                            <span>
                                Usuarios y accesos
                            </span>
                        </NavLink>

                        <NavLink
                            to="/app/administration/whatsapp"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `${styles.navigationItem} ${
                                    isActive
                                        ? styles.navigationItemActive
                                        : ""
                                }`
                            }
                        >
                            <span className={styles.navigationIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />

                                    <path d="M8.5 8.5c.4 3 2 4.7 5 6" />
                                    <path d="M8.7 8.4 10 8" />
                                    <path d="m13.5 14.5.5-1.3" />
                                </svg>
                            </span>

                            <span>
                                WhatsApp
                            </span>
                        </NavLink>

                        <span className={styles.navigationTitle}>
                            Control
                        </span>

                        <NavLink
                            to="/app/auditing"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `${styles.navigationItem} ${
                                    isActive
                                        ? styles.navigationItemActive
                                        : ""
                                }`
                            }
                        >
                            <span className={styles.navigationIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M5 4h14v16H5z" />
                                    <path d="M8 8h8" />
                                    <path d="M8 12h5" />

                                    <circle
                                        cx="15.5"
                                        cy="15.5"
                                        r="2.5"
                                    />

                                    <path d="m17.3 17.3 2.2 2.2" />
                                </svg>
                            </span>

                            <span>
                                Auditoría
                            </span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className={styles.sidebarFooter}>
                <div className={styles.userSummary}>
                    <div className={styles.userAvatar}>
                        {(user?.first_name || user?.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className={styles.userInformation}>
                        <strong>
                            {userName}
                        </strong>

                        <span>
                            {user?.role || "Usuario"}
                        </span>
                    </div>
                </div>

                <button
                    className={styles.mobileLogoutButton}
                    type="button"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}

export default SideBar;
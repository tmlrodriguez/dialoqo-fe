import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import dialoqoLogo from "../../assets/dialoqo-logo.png";
import LanguageSelector from "../../components/common/LanguageSelector/LanguageSelector.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

import styles from "./LoginPage.module.css";
import { usePageTranslation } from "../usePageTranslation.js";


/**
 * LoginPage
 *
 * Description:
 * - Proporcionar la interfaz de autenticación de Dialoqo.
 *
 * Notes:
 * - Los usuarios autenticados son redirigidos a la aplicación.
 * - Los errores de autenticación del backend se muestran dentro del formulario.
 */
function LoginPage() {
    const { t } = usePageTranslation();
    const navigate = useNavigate();
    const { login, isAuthenticated, isLoading } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return (
            <main className={styles.loginPage}>
                <div className={styles.loginLoading}>
                    {t("Cargando Dialoqo...")}
                </div>
            </main>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/app" replace />;
    }


    /**
     * handleSubmit
     *
     * Description:
     * - Autenticar al usuario utilizando las credenciales ingresadas.
     *
     * Notes:
     * - Evita envíos duplicados mientras la solicitud está en proceso.
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const authenticatedUser = await login({ username, password });
            const destination = authenticatedUser?.role === "MEMBER" ? "/app/monitoring" : "/app";

            navigate(destination, {
                replace: true,
            });
        } catch (error) {
            setErrorMessage(
                error.message ||
                t("No fue posible iniciar sesión.")
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={styles.loginPage}>
            <div style={{ position: "fixed", top: "18px", right: "22px", zIndex: 20 }}><LanguageSelector /></div>
            <section className={styles.loginPanel}>
                <div className={styles.loginBrand}>
                    <div className={styles.loginBrandLogoWrap}>
                        <img
                            src={dialoqoLogo}
                            alt="Dialoqo"
                            className={styles.loginBrandLogo}
                        />
                    </div>

                    <div>
                        <h1>Dialoqo</h1>

                        <p>
                            {t("Plataforma de inteligencia conversacional")}
                        </p>
                    </div>
                </div>

                <div className={styles.loginContent}>
                    <div className={styles.loginHeading}>
                        <h2>{t("Bienvenido")}</h2>

                        <p>
                            {t("Inicia sesión para acceder a la inteligencia detrás de tus conversaciones.")}
                        </p>
                    </div>

                    <form
                        className={styles.loginForm}
                        onSubmit={handleSubmit}
                    >
                        <div className={styles.loginField}>
                            <label htmlFor="username">
                                {t("Usuario")}
                            </label>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                autoComplete="username"
                                placeholder={t("Ingresa tu usuario")}
                                disabled={isSubmitting}
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.loginField}>
                            <label htmlFor="password">
                                {t("Contraseña")}
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                                placeholder={t("Ingresa tu contraseña")}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {errorMessage && (
                            <div
                                className={styles.loginError}
                                role="alert"
                            >
                                {errorMessage}
                            </div>
                        )}

                        <button
                            className={styles.loginSubmit}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? t("Iniciando sesión...")
                                : t("Iniciar sesión")}
                        </button>
                    </form>
                </div>

                <footer className={styles.loginFooter}>
                    <span>Dialoqo</span>

                    <span>
                        {t("Inteligencia detrás de cada conversación")}
                    </span>
                </footer>
            </section>

            <section className={styles.loginVisual}>
                <div className={styles.loginVisualContent}>
                    <div className={styles.loginVisualLogoWrap}>
                        <img
                            src={dialoqoLogo}
                            alt=""
                            aria-hidden="true"
                            className={styles.loginVisualLogo}
                        />
                    </div>

                    <span className={styles.loginEyebrow}>
                        {t("Inteligencia conversacional")}
                    </span>

                    <h2>
                        {t("Convierte cada conversación en información que tu empresa puede entender y utilizar.")}
                    </h2>

                    <p>
                        {t("Dialoqo centraliza las comunicaciones de tu organización para escuchar, observar, interpretar y detectar lo que ocurre en cada conversación.")}
                    </p>

                    <div className={styles.loginFeatureList}>
                        <div className={styles.loginFeature}>
                            <strong>
                                {t("Escucha y observa")}
                            </strong>

                            <span>
                                {t("Mantén visibles las conversaciones de tu organización en tiempo real.")}
                            </span>
                        </div>

                        <div className={styles.loginFeature}>
                            <strong>
                                Lee y entiende
                            </strong>

                            <span>
                                Transforma mensajes y contexto en información útil para la operación.
                            </span>
                        </div>

                        <div className={styles.loginFeature}>
                            <strong>
                                Detecta y alerta
                            </strong>

                            <span>
                                Identifica situaciones importantes para que puedan atenderse oportunamente.
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default LoginPage;

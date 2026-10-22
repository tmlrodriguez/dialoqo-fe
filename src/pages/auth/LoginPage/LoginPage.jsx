import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import LanguageSelector from "../../../components/common/navigation/LanguageSelector/LanguageSelector.jsx";
import Page from "../../../components/common/layout/Page/Page.jsx";
import LoginPanel from "../../../components/auth/panels/LoginPanel/LoginPanel.jsx";
import LoginVisual from "../../../components/auth/visuals/LoginVisual/LoginVisual.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { usePageTranslation } from "../../../hooks/usePageTranslation.js";

import styles from "./LoginPage.module.css";

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

    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return (
            <Page as="main" title={t("Iniciar sesión")} className={styles.loginPage}>
                <div className={styles.loginLoading}>{t("Cargando Dialoqo...")}</div>
            </Page>
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
    async function handleSubmit(credentials) {
        if (isSubmitting) {
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const authenticatedUser = await login(credentials);
            const destination = authenticatedUser?.role === "MEMBER" ? "/app/monitoring" : "/app";

            navigate(destination, {
                replace: true,
            });
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible iniciar sesión."));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Page as="main" title={t("Iniciar sesión")} className={styles.loginPage}>
            <div className={styles.languageSelector}>
                <LanguageSelector compact />
            </div>

            <LoginPanel
                t={t}
                handleSubmit={handleSubmit}
                errorMessage={errorMessage}
                isSubmitting={isSubmitting}
            />

            <LoginVisual t={t} />
        </Page>
    );
}

export default LoginPage;

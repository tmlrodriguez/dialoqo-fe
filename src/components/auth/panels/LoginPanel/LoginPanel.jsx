import dialoqoLogo from "../../../../assets/dialoqo-logo.png";
import LoginForm from "../../forms/LoginForm/LoginForm.jsx";

import styles from "./LoginPanel.module.css";

/**
 * LoginPanel
 * Description: Present the panel section with page-owned data and actions.
 */
function LoginPanel({ t, handleSubmit, errorMessage, isSubmitting }) {
    return (
        <section className={styles.loginPanel}>
            <div className={styles.loginBrand}>
                <div className={styles.loginBrandLogoWrap}>
                    <img src={dialoqoLogo} alt="Dialoqo" className={styles.loginBrandLogo} />
                </div>

                <div className={styles.loginBrandText}>
                    <h1>Dialoqo</h1>

                    <p>{t("Plataforma de inteligencia conversacional")}</p>
                </div>
            </div>

            <div className={styles.loginContent}>
                <div className={styles.loginHeading}>
                    <h2>{t("Bienvenido")}</h2>

                    <p>
                        {t(
                            "Inicia sesión para acceder a la inteligencia detrás de tus conversaciones.",
                        )}
                    </p>
                </div>

                <LoginForm
                    onSubmit={handleSubmit}
                    errorMessage={errorMessage}
                    isSubmitting={isSubmitting}
                />
            </div>

            <footer className={styles.loginFooter}>
                <span>Dialoqo</span>

                <span>{t("Inteligencia detrás de cada conversación")}</span>
            </footer>
        </section>
    );
}

export default LoginPanel;

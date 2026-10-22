import dialoqoLogo from "../../../../assets/dialoqo-logo.png";

import styles from "./LoginVisual.module.css";

/**
 * LoginVisual
 * Description: Present the visual section with page-owned data and actions.
 */
function LoginVisual({ t }) {
    return (
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

                <span className={styles.loginEyebrow}>{t("Inteligencia conversacional")}</span>

                <h2>
                    {t(
                        "Convierte cada conversación en información que tu empresa puede entender y utilizar.",
                    )}
                </h2>

                <p>
                    {t(
                        "Dialoqo centraliza las comunicaciones de tu organización para escuchar, observar, interpretar y detectar lo que ocurre en cada conversación.",
                    )}
                </p>

                <div className={styles.loginFeatureList}>
                    <div className={styles.loginFeature}>
                        <strong>{t("Escucha y observa")}</strong>

                        <span>
                            {t(
                                "Mantén visibles las conversaciones de tu organización en tiempo real.",
                            )}
                        </span>
                    </div>

                    <div className={styles.loginFeature}>
                        <strong>{t("Lee y entiende")}</strong>

                        <span>
                            {t(
                                "Transforma mensajes y contexto en información útil para la operación.",
                            )}
                        </span>
                    </div>

                    <div className={styles.loginFeature}>
                        <strong>{t("Detecta y alerta")}</strong>

                        <span>
                            {t(
                                "Identifica situaciones importantes para que puedan atenderse oportunamente.",
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LoginVisual;

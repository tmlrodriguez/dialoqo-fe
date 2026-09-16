import styles from "./DashboardPage.module.css";
import { usePageTranslation } from "../usePageTranslation.js";


/**
 * DashboardPage
 *
 * Description:
 * - Proporcionar la vista principal del dashboard de Dialoqo.
 *
 * Notes:
 * - Los indicadores reales serán integrados posteriormente con el backend.
 */
function DashboardPage() {
    const { t } = usePageTranslation();
    return (
        <section className={styles.dashboard}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>{t("Resumen general")}</span>
                    <h1>{t("Dashboard")}</h1>
                    <p>{t("Bienvenido a Dialoqo. Consulta el estado general de la plataforma.")}</p>
                </div>
            </div>

            <div className={styles.metrics}>
                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>{t("Conversaciones activas")}</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>{t("Conversaciones actualmente monitoreadas.")}</span>
                </article>

                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>{t("Mensajes sin leer")}</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>{t("Mensajes pendientes de revisión.")}</span>
                </article>

                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>{t("Números monitoreados")}</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>{t("Números de WhatsApp con monitoreo activo.")}</span>
                </article>

                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>{t("Estado de Meta")}</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>{t("Estado general de las integraciones configuradas.")}</span>
                </article>
            </div>

            <div className={styles.workspace}>
                <div className={styles.workspaceHeader}>
                    <div>
                        <h2>{t("Actividad reciente")}</h2>
                        <p>{t("La actividad reciente aparecerá aquí cuando integremos los datos del backend.")}</p>
                    </div>
                </div>

                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>◉</div>
                    <strong>{t("Aún no hay información para mostrar")}</strong>
                    <span>{t("Los eventos y conversaciones recientes aparecerán en esta sección.")}</span>
                </div>
            </div>
        </section>
    );
}

export default DashboardPage;

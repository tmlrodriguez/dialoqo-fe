import styles from "./DashboardPage.module.css";


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
    return (
        <section className={styles.dashboard}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>Resumen general</span>
                    <h1>Dashboard</h1>
                    <p>Bienvenido a Dialoqo. Consulta el estado general de la plataforma.</p>
                </div>
            </div>

            <div className={styles.metrics}>
                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Conversaciones activas</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>Conversaciones actualmente monitoreadas.</span>
                </article>

                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Mensajes sin leer</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>Mensajes pendientes de revisión.</span>
                </article>

                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Números monitoreados</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>Números de WhatsApp con monitoreo activo.</span>
                </article>

                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Estado de Meta</span>
                    <strong>—</strong>
                    <span className={styles.metricDescription}>Estado general de las integraciones configuradas.</span>
                </article>
            </div>

            <div className={styles.workspace}>
                <div className={styles.workspaceHeader}>
                    <div>
                        <h2>Actividad reciente</h2>
                        <p>La actividad reciente aparecerá aquí cuando integremos los datos del backend.</p>
                    </div>
                </div>

                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>◉</div>
                    <strong>Aún no hay información para mostrar</strong>
                    <span>Los eventos y conversaciones recientes aparecerán en esta sección.</span>
                </div>
            </div>
        </section>
    );
}

export default DashboardPage;
import styles from "./AuditEventDetail.module.css";
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";


const CATEGORY_LABELS = {
    ACCESS: "Acceso",
    ORGANIZATION: "Organización",
    MEMBER: "Miembros",
    WHATSAPP: "WhatsApp",
    META: "Meta",
    SECURITY: "Seguridad",
    SYSTEM: "Sistema",
};


const ACTION_LABELS = {
    CREATE: "Crear",
    UPDATE: "Actualizar",
    DELETE: "Eliminar",
    ACTIVATE: "Activar",
    DEACTIVATE: "Desactivar",
    ASSIGN: "Asignar",
    UNASSIGN: "Desasignar",
    CONNECT: "Conectar",
    DISCONNECT: "Desconectar",
    VALIDATE: "Validar",
    OPEN: "Abrir",
    READ: "Leer",
    SEND: "Enviar",
    SYNCHRONIZE: "Sincronizar",
    LOGIN: "Inicio de sesión",
    LOGOUT: "Cierre de sesión",
    GRANT: "Otorgar",
    REVOKE: "Revocar",
};


const SEVERITY_LABELS = {
    INFO: "Información",
    WARNING: "Advertencia",
    CRITICAL: "Crítico",
};


/**
 * AuditEventDetail
 *
 * Description:
 * - Renderizar el detalle completo de un evento de auditoría.
 *
 * Notes:
 * - El componente es únicamente de lectura.
 * - La metadata se muestra en formato JSON legible.
 */
function AuditEventDetail({
    event,
    isLoading,
}) {
    const { t } = usePageTranslation();
    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(getLanguageLocale(), {
            dateStyle: "long",
            timeStyle: "medium",
        }).format(date);
    }


    function getActorLabel(actor) {
        if (!actor) {
            return "SYSTEM";
        }

        const fullName = [
            actor.first_name,
            actor.last_name,
        ]
            .filter(Boolean)
            .join(" ");

        return fullName || actor.username || t("Usuario");
    }


    function formatMetadata(metadata) {
        if (!metadata || Object.keys(metadata).length === 0) {
            return "{}";
        }

        return JSON.stringify(metadata, null, 2);
    }


    if (isLoading) {
        return (
            <section className={styles.detailPanel}>
                <div className={styles.loadingState}>
                    {t("Cargando detalle...")}
                </div>
            </section>
        );
    }


    if (!event) {
        return (
            <section className={styles.detailPanel}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M5 3h10l4 4v14H5Z" />
                            <path d="M15 3v5h4" />
                            <path d="M9 12h6" />
                            <path d="M9 16h4" />
                        </svg>
                    </div>

                    <strong>
                        Seleccione un evento.
                    </strong>

                    <span>
                        El detalle completo del evento aparecerá en esta sección.
                    </span>
                </div>
            </section>
        );
    }


    return (
        <section className={styles.detailPanel}>
            <div className={styles.detailHeader}>
                <div>
                    <span className={styles.detailEyebrow}>
                        Evento #{event.id}
                    </span>

                    <h2>
                        Detalle de auditoría
                    </h2>
                </div>

                <span
                    className={`${styles.severityBadge} ${
                        event.severity === "CRITICAL"
                            ? styles.severityCritical
                            : event.severity === "WARNING"
                                ? styles.severityWarning
                                : styles.severityInfo
                    }`}
                >
                    {t(SEVERITY_LABELS[event.severity] || event.severity)}
                </span>
            </div>

            <div className={styles.detailContent}>
                <div className={styles.summarySection}>
                    <div className={styles.badgeRow}>
                        <span className={styles.categoryBadge}>
                            {t(CATEGORY_LABELS[event.category] || event.category)}
                        </span>

                        <span className={styles.actionBadge}>
                            {t(ACTION_LABELS[event.action] || event.action)}
                        </span>
                    </div>

                    <p className={styles.description}>
                        {event.description}
                    </p>
                </div>

                <div className={styles.detailGrid}>
                    <div className={styles.detailField}>
                        <span>{t("Fecha y hora")}</span>
                        <strong>{formatDateTime(event.occurred_at)}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Actor")}</span>
                        <strong>{getActorLabel(event.actor)}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Usuario")}</span>
                        <strong>{event.actor?.username || "SYSTEM"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Empresa")}</span>
                        <strong>{event.company?.name || "—"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Sucursal")}</span>
                        <strong>{event.branch?.name || "—"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Aplicación destino")}</span>
                        <strong>{event.target_app || "—"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Modelo destino")}</span>
                        <strong>{event.target_model || "—"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("ID del recurso")}</span>
                        <strong>{event.target_id || "—"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Recurso")}</span>
                        <strong>{event.target_label || "—"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Request ID")}</span>
                        <strong>{event.request_id || "—"}</strong>
                    </div>

                    <div className={styles.detailField}>
                        <span>{t("Dirección IP")}</span>
                        <strong>{event.ip_address || "—"}</strong>
                    </div>
                </div>

                <div className={styles.technicalSection}>
                    <div className={styles.sectionHeader}>
                        <h3>{t("Metadata")}</h3>

                        <p>
                            Información contextual registrada junto al evento.
                        </p>
                    </div>

                    <pre className={styles.metadataBlock}>
                        {formatMetadata(event.metadata)}
                    </pre>
                </div>

                <div className={styles.technicalSection}>
                    <div className={styles.sectionHeader}>
                        <h3>{t("User agent")}</h3>

                        <p>
                            Cliente utilizado para generar la solicitud.
                        </p>
                    </div>

                    <div className={styles.userAgentBlock}>
                        {event.user_agent || t("No disponible.")}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AuditEventDetail;

import styles from "./AuditEventList.module.css";
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
 * AuditEventList
 *
 * Description:
 * - Renderizar el listado paginado de eventos de auditoría.
 *
 * Notes:
 * - El componente no ejecuta solicitudes HTTP.
 * - La selección de un evento es delegada al componente padre.
 */
function AuditEventList({
    events,
    selectedEventId,
    count,
    page,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    onSelectEvent,
    onPageChange,
}) {
    const { t } = usePageTranslation();
    const totalPages = Math.max(
        1,
        Math.ceil(count / pageSize)
    );


    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(getLanguageLocale(), {
            dateStyle: "medium",
            timeStyle: "short",
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


    function getTargetLabel(event) {
        if (event.target_label) {
            return event.target_label;
        }

        const targetParts = [
            event.target_model,
            event.target_id,
        ].filter(Boolean);

        if (targetParts.length > 0) {
            return targetParts.join(" #");
        }

        return t("Sin recurso específico");
    }


    return (
        <section className={styles.listPanel}>
            <div className={styles.listHeader}>
                <div>
                    <h2>{t("Eventos de auditoría")}</h2>

                    <p>
                        {count === 1
                            ? "1 evento encontrado."
                            : `${count} eventos encontrados.`}
                    </p>
                </div>

                <div className={styles.pageIndicator}>
                    Página {page} de {totalPages}
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loadingState}>
                    Cargando eventos...
                </div>
            ) : events.length === 0 ? (
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
                            <path d="M8 12h8" />
                            <path d="M8 16h5" />
                        </svg>
                    </div>

                    <strong>
                        No existen eventos para mostrar.
                    </strong>

                    <span>
                        Modifique los filtros o seleccione otra empresa.
                    </span>
                </div>
            ) : (
                <div className={styles.eventList}>
                    {events.map((event) => {
                        const isSelected = selectedEventId === event.id;

                        return (
                            <button
                                key={event.id}
                                className={`${styles.eventCard} ${isSelected ? styles.eventCardActive : ""}`}
                                type="button"
                                onClick={() => onSelectEvent(event)}
                            >
                                <div className={styles.eventTopRow}>
                                    <div className={styles.eventBadges}>
                                        <span className={styles.categoryBadge}>
                                            {t(CATEGORY_LABELS[event.category] || event.category)}
                                        </span>

                                        <span className={styles.actionBadge}>
                                            {t(ACTION_LABELS[event.action] || event.action)}
                                        </span>

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

                                    <span className={styles.eventDate}>
                                        {formatDateTime(event.occurred_at)}
                                    </span>
                                </div>

                                <div className={styles.eventDescription}>
                                    {event.description}
                                </div>

                                <div className={styles.eventMetadata}>
                                    <div className={styles.metadataItem}>
                                        <span>{t("Actor")}</span>
                                        <strong>{getActorLabel(event.actor)}</strong>
                                    </div>

                                    <div className={styles.metadataItem}>
                                        <span>{t("Recurso")}</span>
                                        <strong>{getTargetLabel(event)}</strong>
                                    </div>

                                    {event.branch && (
                                        <div className={styles.metadataItem}>
                                            <span>{t("Sucursal")}</span>
                                            <strong>{event.branch.name}</strong>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className={styles.pagination}>
                <button
                    className={styles.paginationButton}
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPreviousPage || isLoading}
                >
                    {t("Anterior")}
                </button>

                <span className={styles.paginationStatus}>
                    {page} / {totalPages}
                </span>

                <button
                    className={styles.paginationButton}
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNextPage || isLoading}
                >
                    {t("Siguiente")}
                </button>
            </div>
        </section>
    );
}

export default AuditEventList;

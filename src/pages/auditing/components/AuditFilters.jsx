import { useState } from "react";

import styles from "./AuditFilters.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


const CATEGORY_OPTIONS = [
    {
        value: "",
        label: "Todas las categorías",
    },
    {
        value: "ACCESS",
        label: "Acceso",
    },
    {
        value: "ORGANIZATION",
        label: "Organización",
    },
    {
        value: "MEMBER",
        label: "Miembros",
    },
    {
        value: "WHATSAPP",
        label: "WhatsApp",
    },
    {
        value: "META",
        label: "Meta",
    },
    {
        value: "SECURITY",
        label: "Seguridad",
    },
    {
        value: "SYSTEM",
        label: "Sistema",
    },
];


const ACTION_OPTIONS = [
    {
        value: "",
        label: "Todas las acciones",
    },
    {
        value: "CREATE",
        label: "Crear",
    },
    {
        value: "UPDATE",
        label: "Actualizar",
    },
    {
        value: "DELETE",
        label: "Eliminar",
    },
    {
        value: "ACTIVATE",
        label: "Activar",
    },
    {
        value: "DEACTIVATE",
        label: "Desactivar",
    },
    {
        value: "ASSIGN",
        label: "Asignar",
    },
    {
        value: "UNASSIGN",
        label: "Desasignar",
    },
    {
        value: "CONNECT",
        label: "Conectar",
    },
    {
        value: "DISCONNECT",
        label: "Desconectar",
    },
    {
        value: "VALIDATE",
        label: "Validar",
    },
    {
        value: "OPEN",
        label: "Abrir",
    },
    {
        value: "READ",
        label: "Leer",
    },
    {
        value: "SEND",
        label: "Enviar",
    },
    {
        value: "SYNCHRONIZE",
        label: "Sincronizar",
    },
    {
        value: "LOGIN",
        label: "Inicio de sesión",
    },
    {
        value: "LOGOUT",
        label: "Cierre de sesión",
    },
    {
        value: "GRANT",
        label: "Otorgar",
    },
    {
        value: "REVOKE",
        label: "Revocar",
    },
];


const SEVERITY_OPTIONS = [
    {
        value: "",
        label: "Todas las severidades",
    },
    {
        value: "INFO",
        label: "Información",
    },
    {
        value: "WARNING",
        label: "Advertencia",
    },
    {
        value: "CRITICAL",
        label: "Crítico",
    },
];


/**
 * AuditFilters
 *
 * Description:
 * - Renderizar los filtros disponibles para consultar eventos de auditoría.
 *
 * Notes:
 * - Los filtros principales permanecen siempre visibles.
 * - Los filtros técnicos se muestran dentro de una sección avanzada.
 * - El componente no ejecuta solicitudes directamente.
 */
function AuditFilters({
    filters,
    branches,
    isLoadingBranches,
    isLoading,
    onFilterChange,
    onApply,
    onReset,
}) {
    const { language, t } = usePageTranslation();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);


    function handleSubmit(event) {
        event.preventDefault();

        onApply();
    }


    return (
        <section className={styles.filtersPanel}>
            <div className={styles.filtersHeader}>
                <div>
                    <h2>{t("Filtros")}</h2>

                    <p>{language === "en" ? "Refine the audit history using the available criteria." : "Refine el historial de auditoría utilizando los criterios disponibles."}</p>
                </div>

                <button
                    className={styles.advancedToggle}
                    type="button"
                    onClick={() => setShowAdvancedFilters((currentValue) => !currentValue)}
                    disabled={isLoading}
                >
                    {showAdvancedFilters
                        ? (language === "en" ? "Hide advanced filters" : "Ocultar filtros avanzados")
                        : t("Filtros avanzados")}
                </button>
            </div>

            <form
                className={styles.filtersForm}
                onSubmit={handleSubmit}
            >
                <div className={styles.primaryFilters}>
                    <div className={`${styles.formField} ${styles.searchField}`}>
                        <label htmlFor="audit-search">
                            {t("Buscar")}
                        </label>

                        <input
                            id="audit-search"
                            type="search"
                            value={filters.search}
                            onChange={(event) => onFilterChange("search", event.target.value)}
                            placeholder={t("Descripción, usuario, recurso...")}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-category">
                            {t("Categoría")}
                        </label>

                        <select
                            id="audit-category"
                            value={filters.category}
                            onChange={(event) => onFilterChange("category", event.target.value)}
                            disabled={isLoading}
                        >
                            {CATEGORY_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {t(option.label)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-action">
                            {t("Acción")}
                        </label>

                        <select
                            id="audit-action"
                            value={filters.action}
                            onChange={(event) => onFilterChange("action", event.target.value)}
                            disabled={isLoading}
                        >
                            {ACTION_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {t(option.label)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-severity">
                            {t("Severidad")}
                        </label>

                        <select
                            id="audit-severity"
                            value={filters.severity}
                            onChange={(event) => onFilterChange("severity", event.target.value)}
                            disabled={isLoading}
                        >
                            {SEVERITY_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {t(option.label)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-date-from">
                            {t("Desde")}
                        </label>

                        <input
                            id="audit-date-from"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(event) => onFilterChange("dateFrom", event.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-date-to">
                            {t("Hasta")}
                        </label>

                        <input
                            id="audit-date-to"
                            type="date"
                            value={filters.dateTo}
                            onChange={(event) => onFilterChange("dateTo", event.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {showAdvancedFilters && (
                    <div className={styles.advancedFilters}>
                        <div className={styles.advancedHeader}>
                            <span>{t("Filtros avanzados")}</span>

                            <p>{language === "en" ? "Use these fields for technical investigations or specific traceability." : "Utilice estos campos para investigaciones técnicas o trazabilidad específica."}</p>
                        </div>

                        <div className={styles.advancedGrid}>
                            <div className={styles.formField}>
                                <label htmlFor="audit-branch">
                                    {t("Sucursal")}
                                </label>

                                <select
                                    id="audit-branch"
                                    value={filters.branchId}
                                    onChange={(event) => onFilterChange("branchId", event.target.value)}
                                    disabled={isLoading || isLoadingBranches}
                                >
                                    <option value="">
                                        {language === "en" ? "All branches" : "Todas las sucursales"}
                                    </option>

                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-actor-id">
                                    {language === "en" ? "Actor ID" : "ID del actor"}
                                </label>

                                <input
                                    id="audit-actor-id"
                                    type="number"
                                    min="1"
                                    value={filters.actorId}
                                    onChange={(event) => onFilterChange("actorId", event.target.value)}
                                    placeholder={language === "en" ? "E.g. 15" : "Ej. 15"}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-target-app">
                                    {t("Aplicación destino")}
                                </label>

                                <input
                                    id="audit-target-app"
                                    type="text"
                                    value={filters.targetApp}
                                    onChange={(event) => onFilterChange("targetApp", event.target.value)}
                                    placeholder={language === "en" ? "E.g. organizations" : "Ej. organizations"}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-target-model">
                                    {t("Modelo destino")}
                                </label>

                                <input
                                    id="audit-target-model"
                                    type="text"
                                    value={filters.targetModel}
                                    onChange={(event) => onFilterChange("targetModel", event.target.value)}
                                    placeholder={language === "en" ? "E.g. company" : "Ej. company"}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-target-id">
                                    {t("ID del recurso")}
                                </label>

                                <input
                                    id="audit-target-id"
                                    type="text"
                                    value={filters.targetId}
                                    onChange={(event) => onFilterChange("targetId", event.target.value)}
                                    placeholder={language === "en" ? "Resource ID" : "Identificador del recurso"}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-request-id">
                                    {t("Request ID")}
                                </label>

                                <input
                                    id="audit-request-id"
                                    type="text"
                                    value={filters.requestId}
                                    onChange={(event) => onFilterChange("requestId", event.target.value)}
                                    placeholder={language === "en" ? "Request ID" : "Identificador de solicitud"}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.filtersActions}>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={onReset}
                        disabled={isLoading}
                    >
                        {t("Limpiar filtros")}
                    </button>

                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? (language === "en" ? "Loading..." : "Consultando...")
                            : (language === "en" ? "Apply filters" : "Aplicar filtros")}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default AuditFilters;

import { useState } from "react";

import Button from "../../../common/buttons/Button/Button.jsx";
import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";
import { useKeyedState } from "../../../../hooks/useKeyedState.js";
import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";
import { INITIAL_FILTERS } from "../../../../data/auditFilters.js";

import styles from "./AuditFilters.module.css";

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
    resourceKey,
    branches,
    isLoadingBranches,
    isLoading,

    onApply,
    onReset,
}) {
    const { language, t } = usePageTranslation();
    const [filters, setFilters] = useKeyedState(() => ({ ...INITIAL_FILTERS }), resourceKey);

    function onFilterChange(field, value) {
        setFilters((current) => ({ ...current, [field]: value }));
    }

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();

        onApply(filters);
    }

    return (
        <section className={styles.filtersPanel}>
            <div className={styles.filtersHeader}>
                <div>
                    <h2>{t("Filtros")}</h2>

                    <p>
                        {language === "en"
                            ? "Refine the audit history using the available criteria."
                            : "Refine el historial de auditoría utilizando los criterios disponibles."}
                    </p>
                </div>

                <Button
                    className={styles.advancedToggle}
                    type="button"
                    onClick={() => setShowAdvancedFilters((currentValue) => !currentValue)}
                    disabled={isLoading}
                >
                    {showAdvancedFilters
                        ? language === "en"
                            ? "Hide advanced filters"
                            : "Ocultar filtros avanzados"
                        : t("Filtros avanzados")}
                </Button>
            </div>

            <Form className={styles.filtersForm} onSubmit={handleSubmit}>
                <div className={styles.primaryFilters}>
                    <div className={`${styles.formField} ${styles.searchField}`}>
                        <label htmlFor="audit-search">{t("Buscar")}</label>

                        <Input
                            id="audit-search"
                            type="search"
                            value={filters.search}
                            onChange={(event) => onFilterChange("search", event.target.value)}
                            placeholder={t("Descripción, usuario, recurso...")}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-category">{t("Categoría")}</label>

                        <Input
                            as="select"
                            id="audit-category"
                            value={filters.category}
                            onChange={(event) => onFilterChange("category", event.target.value)}
                            disabled={isLoading}
                        >
                            <OptionList
                                items={CATEGORY_OPTIONS}
                                getValue={(option) => option.value}
                                getLabel={(option) => <>{t(option.label)}</>}
                            />
                        </Input>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-action">{t("Acción")}</label>

                        <Input
                            as="select"
                            id="audit-action"
                            value={filters.action}
                            onChange={(event) => onFilterChange("action", event.target.value)}
                            disabled={isLoading}
                        >
                            <OptionList
                                items={ACTION_OPTIONS}
                                getValue={(option) => option.value}
                                getLabel={(option) => <>{t(option.label)}</>}
                            />
                        </Input>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-severity">{t("Severidad")}</label>

                        <Input
                            as="select"
                            id="audit-severity"
                            value={filters.severity}
                            onChange={(event) => onFilterChange("severity", event.target.value)}
                            disabled={isLoading}
                        >
                            <OptionList
                                items={SEVERITY_OPTIONS}
                                getValue={(option) => option.value}
                                getLabel={(option) => <>{t(option.label)}</>}
                            />
                        </Input>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-date-from">{t("Desde")}</label>

                        <Input
                            id="audit-date-from"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(event) => onFilterChange("dateFrom", event.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="audit-date-to">{t("Hasta")}</label>

                        <Input
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

                            <p>
                                {language === "en"
                                    ? "Use these fields for technical investigations or specific traceability."
                                    : "Utilice estos campos para investigaciones técnicas o trazabilidad específica."}
                            </p>
                        </div>

                        <div className={styles.advancedGrid}>
                            <div className={styles.formField}>
                                <label htmlFor="audit-branch">{t("Sucursal")}</label>

                                <Input
                                    as="select"
                                    id="audit-branch"
                                    value={filters.branchId}
                                    onChange={(event) =>
                                        onFilterChange("branchId", event.target.value)
                                    }
                                    disabled={isLoading || isLoadingBranches}
                                >
                                    <option value="">
                                        {language === "en"
                                            ? "All branches"
                                            : "Todas las sucursales"}
                                    </option>

                                    <OptionList
                                        items={branches}
                                        getValue={(branch) => branch.id}
                                        getLabel={(branch) => <>{branch.name}</>}
                                    />
                                </Input>
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-actor-id">
                                    {language === "en" ? "Actor ID" : "ID del actor"}
                                </label>

                                <Input
                                    id="audit-actor-id"
                                    type="number"
                                    min="1"
                                    value={filters.actorId}
                                    onChange={(event) =>
                                        onFilterChange("actorId", event.target.value)
                                    }
                                    placeholder={language === "en" ? "E.g. 15" : "Ej. 15"}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-target-app">{t("Aplicación destino")}</label>

                                <Input
                                    id="audit-target-app"
                                    type="text"
                                    value={filters.targetApp}
                                    onChange={(event) =>
                                        onFilterChange("targetApp", event.target.value)
                                    }
                                    placeholder={
                                        language === "en"
                                            ? "E.g. organizations"
                                            : "Ej. organizations"
                                    }
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-target-model">{t("Modelo destino")}</label>

                                <Input
                                    id="audit-target-model"
                                    type="text"
                                    value={filters.targetModel}
                                    onChange={(event) =>
                                        onFilterChange("targetModel", event.target.value)
                                    }
                                    placeholder={language === "en" ? "E.g. company" : "Ej. company"}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-target-id">{t("ID del recurso")}</label>

                                <Input
                                    id="audit-target-id"
                                    type="text"
                                    value={filters.targetId}
                                    onChange={(event) =>
                                        onFilterChange("targetId", event.target.value)
                                    }
                                    placeholder={
                                        language === "en"
                                            ? "Resource ID"
                                            : "Identificador del recurso"
                                    }
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="audit-request-id">{t("Request ID")}</label>

                                <Input
                                    id="audit-request-id"
                                    type="text"
                                    value={filters.requestId}
                                    onChange={(event) =>
                                        onFilterChange("requestId", event.target.value)
                                    }
                                    placeholder={
                                        language === "en"
                                            ? "Request ID"
                                            : "Identificador de solicitud"
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.filtersActions}>
                    <Button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => {
                            setFilters({ ...INITIAL_FILTERS });
                            onReset();
                        }}
                        disabled={isLoading}
                    >
                        {t("Limpiar filtros")}
                    </Button>

                    <Button className={styles.primaryButton} type="submit" disabled={isLoading}>
                        {isLoading
                            ? language === "en"
                                ? "Loading..."
                                : "Consultando..."
                            : language === "en"
                              ? "Apply filters"
                              : "Aplicar filtros"}
                    </Button>
                </div>
            </Form>
        </section>
    );
}

export default AuditFilters;

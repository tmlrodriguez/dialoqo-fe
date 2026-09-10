import { useEffect, useState } from "react";

import {
    createMessageTemplate,
    deleteMessageTemplate,
    getMessageTemplate,
    getMessageTemplates,
    getWhatsAppBusinessAccounts,
    synchronizeMessageTemplates,
    updateMessageTemplate,
} from "../../../services/whatsapp.js";

import styles from "./TemplateManagement.module.css";


const TEMPLATE_CATEGORIES = [
    {
        value: "",
        label: "Todas",
    },
    {
        value: "MARKETING",
        label: "Marketing",
    },
    {
        value: "UTILITY",
        label: "Utility",
    },
    {
        value: "AUTHENTICATION",
        label: "Authentication",
    },
];


const TEMPLATE_STATUSES = [
    {
        value: "",
        label: "Todos",
    },
    {
        value: "APPROVED",
        label: "Approved",
    },
    {
        value: "PENDING",
        label: "Pending",
    },
    {
        value: "REJECTED",
        label: "Rejected",
    },
    {
        value: "PAUSED",
        label: "Paused",
    },
    {
        value: "DISABLED",
        label: "Disabled",
    },
    {
        value: "PENDING_DELETION",
        label: "Pending deletion",
    },
    {
        value: "IN_APPEAL",
        label: "In appeal",
    },
    {
        value: "UNKNOWN",
        label: "Unknown",
    },
];


const PARAMETER_FORMATS = [
    {
        value: "POSITIONAL",
        label: "Positional",
    },
    {
        value: "NAMED",
        label: "Named",
    },
];


/**
 * TemplateManagement
 *
 * Description:
 * - Administrar las plantillas de WhatsApp pertenecientes a una cuenta WABA.
 *
 * Notes:
 * - Las plantillas pertenecen a una cuenta WABA específica.
 * - El estado de aprobación es controlado por Meta.
 * - Permite crear, consultar, actualizar, eliminar y sincronizar plantillas.
 * - La definición components se administra como JSON normalizado.
 */
function TemplateManagement({
    companyId,
    onError,
    onSuccess,
}) {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState("");

    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [languageFilter, setLanguageFilter] = useState("");

    const [name, setName] = useState("");
    const [language, setLanguage] = useState("");
    const [category, setCategory] = useState("UTILITY");
    const [parameterFormat, setParameterFormat] = useState("POSITIONAL");
    const [componentsText, setComponentsText] = useState("[]");

    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    });

    const [currentPage, setCurrentPage] = useState(1);

    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSynchronizing, setIsSynchronizing] = useState(false);


    function clearParentMessages() {
        onError?.("");
        onSuccess?.("");
    }


    function resetForm() {
        setSelectedTemplate(null);

        setName("");
        setLanguage("");
        setCategory("UTILITY");
        setParameterFormat("POSITIONAL");
        setComponentsText("[]");
    }


    async function loadAccounts() {
        if (!companyId) {
            setAccounts([]);
            setSelectedAccountId("");
            return;
        }

        setIsLoadingAccounts(true);

        try {
            const response = await getWhatsAppBusinessAccounts(companyId);
            const accountList = response?.data || [];

            setAccounts(accountList);

            setSelectedAccountId((currentAccountId) => {
                const accountExists = accountList.some(
                    (account) =>
                        String(account.id) === String(currentAccountId)
                );

                if (accountExists) {
                    return currentAccountId;
                }

                return accountList.length > 0
                    ? String(accountList[0].id)
                    : "";
            });
        } catch (error) {
            setAccounts([]);
            setSelectedAccountId("");

            onError?.(
                error.message ||
                "No fue posible cargar las cuentas de WhatsApp Business."
            );
        } finally {
            setIsLoadingAccounts(false);
        }
    }


    async function loadTemplates(page = 1) {
        if (
            !companyId ||
            !selectedAccountId
        ) {
            setTemplates([]);

            setPagination({
                count: 0,
                next: null,
                previous: null,
            });

            return;
        }

        setIsLoadingTemplates(true);

        try {
            const response = await getMessageTemplates(
                companyId,
                selectedAccountId,
                {
                    search: search.trim(),
                    status: statusFilter,
                    category: categoryFilter,
                    language: languageFilter.trim(),
                    page,
                    pageSize: 30,
                }
            );

            const responseData = response?.data || {};

            setTemplates(responseData.results || []);

            setPagination({
                count: responseData.count || 0,
                next: responseData.next || null,
                previous: responseData.previous || null,
            });

            setCurrentPage(page);
        } catch (error) {
            setTemplates([]);

            setPagination({
                count: 0,
                next: null,
                previous: null,
            });

            onError?.(
                error.message ||
                "No fue posible cargar las plantillas de WhatsApp."
            );
        } finally {
            setIsLoadingTemplates(false);
        }
    }


    function handleAccountChange(event) {
        clearParentMessages();

        setSelectedAccountId(event.target.value);
        setCurrentPage(1);

        resetForm();
    }


    function handleNewTemplate() {
        clearParentMessages();
        resetForm();
    }


    async function handleSelectTemplate(template) {
        if (
            !companyId ||
            !selectedAccountId ||
            !template?.id ||
            isLoadingDetail
        ) {
            return;
        }

        setIsLoadingDetail(true);
        clearParentMessages();

        try {
            const response = await getMessageTemplate(
                companyId,
                selectedAccountId,
                template.id
            );

            const templateDetail = response?.data;

            if (!templateDetail) {
                throw new Error(
                    "No fue posible obtener el detalle de la plantilla."
                );
            }

            setSelectedTemplate(templateDetail);

            setName(templateDetail.name || "");
            setLanguage(templateDetail.language || "");
            setCategory(templateDetail.category || "UTILITY");
            setParameterFormat(
                templateDetail.parameter_format || "POSITIONAL"
            );

            setComponentsText(
                JSON.stringify(
                    templateDetail.components || [],
                    null,
                    2
                )
            );
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible cargar la plantilla."
            );
        } finally {
            setIsLoadingDetail(false);
        }
    }


    function parseComponents() {
        let parsedComponents;

        try {
            parsedComponents = JSON.parse(componentsText);
        } catch {
            throw new Error(
                "El campo Components debe contener JSON válido."
            );
        }

        if (!Array.isArray(parsedComponents)) {
            throw new Error(
                "Components debe contener un arreglo JSON."
            );
        }

        if (parsedComponents.length === 0) {
            throw new Error(
                "La plantilla debe contener al menos un componente."
            );
        }

        return parsedComponents;
    }


    async function handleSubmit(event) {
        event.preventDefault();

        if (
            !companyId ||
            !selectedAccountId ||
            isSaving
        ) {
            return;
        }

        clearParentMessages();

        let components;

        try {
            components = parseComponents();
        } catch (error) {
            onError?.(error.message);

            return;
        }

        setIsSaving(true);

        try {
            if (selectedTemplate) {
                const updateData = {
                    category,
                    components,
                };

                await updateMessageTemplate(
                    companyId,
                    selectedAccountId,
                    selectedTemplate.id,
                    updateData
                );

                onSuccess?.(
                    "Plantilla actualizada correctamente."
                );
            } else {
                const createData = {
                    name: name.trim(),
                    language: language.trim(),
                    category,
                    parameter_format: parameterFormat,
                    components,
                };

                await createMessageTemplate(
                    companyId,
                    selectedAccountId,
                    createData
                );

                onSuccess?.(
                    "Plantilla enviada a Meta correctamente."
                );
            }

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible guardar la plantilla."
            );
        } finally {
            setIsSaving(false);
        }
    }


    async function handleDelete() {
        if (
            !companyId ||
            !selectedAccountId ||
            !selectedTemplate ||
            isDeleting
        ) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea eliminar la plantilla "${selectedTemplate.name}" de Meta?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearParentMessages();

        try {
            const response = await deleteMessageTemplate(
                companyId,
                selectedAccountId,
                selectedTemplate.id
            );

            onSuccess?.(
                response?.success_message ||
                "Plantilla eliminada correctamente."
            );

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible eliminar la plantilla."
            );
        } finally {
            setIsDeleting(false);
        }
    }


    async function handleSynchronize() {
        if (
            !companyId ||
            !selectedAccountId ||
            isSynchronizing
        ) {
            return;
        }

        setIsSynchronizing(true);
        clearParentMessages();

        try {
            const response = await synchronizeMessageTemplates(
                companyId,
                selectedAccountId
            );

            onSuccess?.(
                response?.success_message ||
                "Plantillas sincronizadas correctamente."
            );

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible sincronizar las plantillas con Meta."
            );
        } finally {
            setIsSynchronizing(false);
        }
    }


    function handleApplyFilters(event) {
        event.preventDefault();

        clearParentMessages();
        resetForm();

        loadTemplates(1);
    }


    function handleResetFilters() {
        setSearch("");
        setStatusFilter("");
        setCategoryFilter("");
        setLanguageFilter("");
        setCurrentPage(1);

        clearParentMessages();
        resetForm();

        setTimeout(() => {
            loadTemplates(1);
        }, 0);
    }


    function getStatusLabel(status) {
        const option = TEMPLATE_STATUSES.find(
            (item) => item.value === status
        );

        return option?.label || status || "Unknown";
    }


    function getCategoryLabel(value) {
        const option = TEMPLATE_CATEGORIES.find(
            (item) => item.value === value
        );

        return option?.label || value || "Unknown";
    }


    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("es-HN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }


    const operationInProgress =
        isSaving ||
        isDeleting ||
        isSynchronizing;


    useEffect(() => {
        setAccounts([]);
        setSelectedAccountId("");
        setTemplates([]);

        resetForm();

        loadAccounts();
    }, [companyId]);


    useEffect(() => {
        setTemplates([]);
        setCurrentPage(1);

        resetForm();

        if (selectedAccountId) {
            loadTemplates(1);
        }
    }, [selectedAccountId]);


    return (
        <div className={styles.templateSection}>
            <div className={styles.contextBar}>
                <div className={styles.contextHeader}>
                    <div className={styles.contextField}>
                        <label htmlFor="template-account">
                            Cuenta WABA
                        </label>

                        <select
                            id="template-account"
                            value={selectedAccountId}
                            onChange={handleAccountChange}
                            disabled={
                                isLoadingAccounts ||
                                accounts.length === 0 ||
                                operationInProgress
                            }
                        >
                            {accounts.length === 0 && (
                                <option value="">
                                    No existen cuentas WABA disponibles
                                </option>
                            )}

                            {accounts.map((account) => (
                                <option
                                    key={account.id}
                                    value={account.id}
                                >
                                    {account.display_name} — {account.meta_waba_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className={styles.syncButton}
                        type="button"
                        onClick={handleSynchronize}
                        disabled={
                            !selectedAccountId ||
                            operationInProgress
                        }
                    >
                        {isSynchronizing
                            ? "Sincronizando..."
                            : "Sincronizar con Meta"}
                    </button>
                </div>
            </div>

            {!selectedAccountId ? (
                <section className={styles.emptyPanel}>
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
                            <path d="M5 4h14v16H5z" />
                            <path d="M8 8h8" />
                            <path d="M8 12h8" />
                            <path d="M8 16h5" />
                        </svg>
                    </div>

                    <strong>
                        Seleccione una cuenta WABA.
                    </strong>

                    <span>
                        Las plantillas pertenecen a una cuenta de WhatsApp Business específica.
                    </span>
                </section>
            ) : (
                <>
                    <form
                        className={styles.filters}
                        onSubmit={handleApplyFilters}
                    >
                        <div className={styles.filterField}>
                            <label htmlFor="template-search">
                                Buscar
                            </label>

                            <input
                                id="template-search"
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Nombre o idioma"
                            />
                        </div>

                        <div className={styles.filterField}>
                            <label htmlFor="template-status-filter">
                                Estado
                            </label>

                            <select
                                id="template-status-filter"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                {TEMPLATE_STATUSES.map((option) => (
                                    <option
                                        key={option.value || "all"}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterField}>
                            <label htmlFor="template-category-filter">
                                Categoría
                            </label>

                            <select
                                id="template-category-filter"
                                value={categoryFilter}
                                onChange={(event) => setCategoryFilter(event.target.value)}
                            >
                                {TEMPLATE_CATEGORIES.map((option) => (
                                    <option
                                        key={option.value || "all"}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterField}>
                            <label htmlFor="template-language-filter">
                                Idioma
                            </label>

                            <input
                                id="template-language-filter"
                                type="text"
                                value={languageFilter}
                                onChange={(event) => setLanguageFilter(event.target.value)}
                                placeholder="es, es_HN, en_US..."
                            />
                        </div>

                        <div className={styles.filterActions}>
                            <button
                                className={styles.secondaryButton}
                                type="button"
                                onClick={handleResetFilters}
                            >
                                Limpiar
                            </button>

                            <button
                                className={styles.primaryButton}
                                type="submit"
                            >
                                Aplicar
                            </button>
                        </div>
                    </form>

                    <div className={styles.templateWorkspace}>
                        <section className={styles.listPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <span className={styles.eyebrow}>
                                        Meta
                                    </span>

                                    <h2>
                                        Plantillas
                                    </h2>

                                    <p>
                                        {pagination.count} plantilla
                                        {pagination.count === 1 ? "" : "s"} registrada
                                        {pagination.count === 1 ? "" : "s"}.
                                    </p>
                                </div>

                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={handleNewTemplate}
                                    disabled={operationInProgress}
                                >
                                    Nueva plantilla
                                </button>
                            </div>

                            {isLoadingTemplates ? (
                                <div className={styles.loadingState}>
                                    Cargando plantillas...
                                </div>
                            ) : templates.length === 0 ? (
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
                                            <path d="M5 4h14v16H5z" />
                                            <path d="M8 8h8" />
                                            <path d="M8 12h8" />
                                        </svg>
                                    </div>

                                    <strong>
                                        No existen plantillas.
                                    </strong>

                                    <span>
                                        Sincronice con Meta o cree una nueva plantilla.
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.templateList}>
                                        {templates.map((template) => (
                                            <button
                                                key={template.id}
                                                className={`${styles.templateCard} ${
                                                    selectedTemplate?.id === template.id
                                                        ? styles.templateCardActive
                                                        : ""
                                                }`}
                                                type="button"
                                                onClick={() => handleSelectTemplate(template)}
                                                disabled={isLoadingDetail}
                                            >
                                                <div className={styles.templateCardMain}>
                                                    <div className={styles.templateIcon}>
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M5 4h14v16H5z" />
                                                            <path d="M8 8h8" />
                                                            <path d="M8 12h8" />
                                                        </svg>
                                                    </div>

                                                    <div className={styles.templateInformation}>
                                                        <strong>
                                                            {template.name}
                                                        </strong>

                                                        <span>
                                                            {template.language} · {getCategoryLabel(template.category)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`${styles.statusBadge} ${
                                                        template.status === "APPROVED"
                                                            ? styles.statusApproved
                                                            : template.status === "REJECTED"
                                                                ? styles.statusRejected
                                                                : template.status === "PENDING"
                                                                    ? styles.statusPending
                                                                    : styles.statusNeutral
                                                    }`}
                                                >
                                                    {getStatusLabel(template.status)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className={styles.pagination}>
                                        <button
                                            className={styles.secondaryButton}
                                            type="button"
                                            disabled={!pagination.previous}
                                            onClick={() => loadTemplates(currentPage - 1)}
                                        >
                                            Anterior
                                        </button>

                                        <span>
                                            Página {currentPage}
                                        </span>

                                        <button
                                            className={styles.secondaryButton}
                                            type="button"
                                            disabled={!pagination.next}
                                            onClick={() => loadTemplates(currentPage + 1)}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>

                        <section className={styles.formPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <span className={styles.eyebrow}>
                                        Configuración
                                    </span>

                                    <h2>
                                        {selectedTemplate
                                            ? "Editar plantilla"
                                            : "Nueva plantilla"}
                                    </h2>

                                    <p>
                                        {selectedTemplate
                                            ? "Modifique los campos permitidos por Meta."
                                            : "Defina una nueva plantilla para enviarla a revisión."}
                                    </p>
                                </div>

                                {selectedTemplate && (
                                    <span
                                        className={`${styles.statusBadge} ${
                                            selectedTemplate.status === "APPROVED"
                                                ? styles.statusApproved
                                                : selectedTemplate.status === "REJECTED"
                                                    ? styles.statusRejected
                                                    : selectedTemplate.status === "PENDING"
                                                        ? styles.statusPending
                                                        : styles.statusNeutral
                                        }`}
                                    >
                                        {getStatusLabel(selectedTemplate.status)}
                                    </span>
                                )}
                            </div>

                            <form
                                className={styles.templateForm}
                                onSubmit={handleSubmit}
                            >
                                <div className={styles.formField}>
                                    <label htmlFor="template-name">
                                        Nombre
                                    </label>

                                    <input
                                        id="template-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="order_confirmation"
                                        disabled={
                                            Boolean(selectedTemplate) ||
                                            operationInProgress
                                        }
                                        required
                                    />

                                    <span className={styles.fieldHelp}>
                                        Solo letras minúsculas, números y guiones bajos.
                                    </span>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label htmlFor="template-language">
                                            Idioma
                                        </label>

                                        <input
                                            id="template-language"
                                            type="text"
                                            value={language}
                                            onChange={(event) => setLanguage(event.target.value)}
                                            placeholder="es"
                                            disabled={
                                                Boolean(selectedTemplate) ||
                                                operationInProgress
                                            }
                                            required
                                        />
                                    </div>

                                    <div className={styles.formField}>
                                        <label htmlFor="template-category">
                                            Categoría
                                        </label>

                                        <select
                                            id="template-category"
                                            value={category}
                                            onChange={(event) => setCategory(event.target.value)}
                                            disabled={operationInProgress}
                                            required
                                        >
                                            {TEMPLATE_CATEGORIES
                                                .filter((option) => option.value)
                                                .map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="template-parameter-format">
                                        Formato de parámetros
                                    </label>

                                    <select
                                        id="template-parameter-format"
                                        value={parameterFormat}
                                        onChange={(event) => setParameterFormat(event.target.value)}
                                        disabled={
                                            Boolean(selectedTemplate) ||
                                            operationInProgress
                                        }
                                    >
                                        {PARAMETER_FORMATS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="template-components">
                                        Components
                                    </label>

                                    <textarea
                                        id="template-components"
                                        value={componentsText}
                                        onChange={(event) => setComponentsText(event.target.value)}
                                        placeholder='[{"type":"BODY","text":"Hola {{1}}"}]'
                                        disabled={operationInProgress}
                                        rows="12"
                                        spellCheck="false"
                                        required
                                    />

                                    <span className={styles.fieldHelp}>
                                        Definición normalizada en formato JSON.
                                    </span>
                                </div>

                                {selectedTemplate && (
                                    <div className={styles.lifecycleSection}>
                                        <div className={styles.lifecycleGrid}>
                                            <div>
                                                <span>
                                                    Meta Template ID
                                                </span>

                                                <strong>
                                                    {selectedTemplate.meta_template_id || "—"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Estado
                                                </span>

                                                <strong>
                                                    {getStatusLabel(selectedTemplate.status)}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Disponible en Meta
                                                </span>

                                                <strong>
                                                    {selectedTemplate.is_available_in_meta
                                                        ? "Sí"
                                                        : "No"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Última sincronización
                                                </span>

                                                <strong>
                                                    {formatDateTime(
                                                        selectedTemplate.last_synced_at
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        {selectedTemplate.rejection_reason && (
                                            <div className={styles.rejectionMessage}>
                                                <strong>
                                                    Motivo de rechazo
                                                </strong>

                                                <span>
                                                    {selectedTemplate.rejection_reason}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={styles.formActions}>
                                    {selectedTemplate && (
                                        <button
                                            className={styles.dangerButton}
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={operationInProgress}
                                        >
                                            {isDeleting
                                                ? "Eliminando..."
                                                : "Eliminar"}
                                        </button>
                                    )}

                                    <div className={styles.primaryActions}>
                                        {selectedTemplate && (
                                            <button
                                                className={styles.secondaryButton}
                                                type="button"
                                                onClick={resetForm}
                                                disabled={operationInProgress}
                                            >
                                                Cancelar
                                            </button>
                                        )}

                                        <button
                                            className={styles.primaryButton}
                                            type="submit"
                                            disabled={
                                                !selectedAccountId ||
                                                operationInProgress
                                            }
                                        >
                                            {isSaving
                                                ? "Guardando..."
                                                : selectedTemplate
                                                    ? "Guardar cambios"
                                                    : "Enviar a Meta"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}

export default TemplateManagement;
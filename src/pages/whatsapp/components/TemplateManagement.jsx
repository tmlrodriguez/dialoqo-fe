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
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";


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
        label: "Utilidad",
    },
    {
        value: "AUTHENTICATION",
        label: "Autenticación",
    },
];


const TEMPLATE_STATUSES = [
    {
        value: "",
        label: "Todos",
    },
    {
        value: "APPROVED",
        label: "Aprobada",
    },
    {
        value: "PENDING",
        label: "Pendiente",
    },
    {
        value: "REJECTED",
        label: "Rechazada",
    },
    {
        value: "PAUSED",
        label: "Pausada",
    },
    {
        value: "DISABLED",
        label: "Deshabilitada",
    },
    {
        value: "PENDING_DELETION",
        label: "Pendiente de eliminación",
    },
    {
        value: "IN_APPEAL",
        label: "En apelación",
    },
    {
        value: "UNKNOWN",
        label: "Desconocido",
    },
];


const PARAMETER_FORMATS = [
    {
        value: "POSITIONAL",
        label: "Posicional",
    },
    {
        value: "NAMED",
        label: "Nombrado",
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
    const { t } = usePageTranslation();
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
                t("No fue posible cargar las cuentas de WhatsApp Business.")
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
                t("No fue posible cargar las plantillas de WhatsApp.")
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
                    t("No fue posible obtener el detalle de la plantilla.")
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
                t("No fue posible cargar la plantilla.")
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
                t("El campo Components debe contener JSON válido.")
            );
        }

        if (!Array.isArray(parsedComponents)) {
            throw new Error(
                t("Components debe contener un arreglo JSON.")
            );
        }

        if (parsedComponents.length === 0) {
            throw new Error(
                t("La plantilla debe contener al menos un componente.")
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
                    t("Plantilla actualizada correctamente.")
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
                    t("Plantilla enviada a Meta correctamente.")
                );
            }

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible guardar la plantilla.")
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
            `${t("¿Desea eliminar la plantilla")} "${selectedTemplate.name}" ${t("de Meta?")}`
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
                t("Plantilla eliminada correctamente.")
            );

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible eliminar la plantilla.")
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
                t("Plantillas sincronizadas correctamente.")
            );

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible sincronizar las plantillas con Meta.")
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

        return option?.label ? t(option.label) : status || t("Desconocido");
    }


    function getCategoryLabel(value) {
        const option = TEMPLATE_CATEGORIES.find(
            (item) => item.value === value
        );

        return option?.label ? t(option.label) : value || t("Desconocido");
    }


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
                            {t("Cuenta WABA")}
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
                                    {t("No existen cuentas WABA disponibles")}
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
                            ? t("Sincronizando...")
                            : t("Sincronizar con Meta")}
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
                        {t("Seleccione una cuenta WABA.")}
                    </strong>

                    <span>
                        {t("Las plantillas pertenecen a una cuenta de WhatsApp Business específica.")}
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
                                {t("Buscar")}
                            </label>

                            <input
                                id="template-search"
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t("Nombre o idioma")}
                            />
                        </div>

                        <div className={styles.filterField}>
                            <label htmlFor="template-status-filter">
                                {t("Estado")}
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
                                        {t(option.label)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterField}>
                            <label htmlFor="template-category-filter">
                                {t("Categoría")}
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
                                        {t(option.label)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterField}>
                            <label htmlFor="template-language-filter">
                                {t("Idioma")}
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
                                {t("Limpiar")}
                            </button>

                            <button
                                className={styles.primaryButton}
                                type="submit"
                            >
                                {t("Aplicar")}
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
                                        {t("Plantillas")}
                                    </h2>

                                    <p>
                                        {pagination.count} {pagination.count === 1
                                            ? t("plantilla registrada")
                                            : t("plantillas registradas")}
                                    </p>
                                </div>

                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={handleNewTemplate}
                                    disabled={operationInProgress}
                                >
                                    {t("Nueva plantilla")}
                                </button>
                            </div>

                            {isLoadingTemplates ? (
                                <div className={styles.loadingState}>
                                    {t("Cargando plantillas...")}
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
                                        {t("No existen plantillas.")}
                                    </strong>

                                    <span>
                                        {t("Sincronice con Meta o cree una nueva plantilla.")}
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
                                            {t("Anterior")}
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
                                            {t("Siguiente")}
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>

                        <section className={styles.formPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <span className={styles.eyebrow}>
                                        {t("Configuración")}
                                    </span>

                                    <h2>
                                        {selectedTemplate
                                            ? t("Editar plantilla")
                                            : t("Nueva plantilla")}
                                    </h2>

                                    <p>
                                        {selectedTemplate
                                            ? t("Modifique los campos permitidos por Meta.")
                                            : t("Defina una nueva plantilla para enviarla a revisión.")}
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
                                        {t("Nombre")}
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
                                        {t("Solo letras minúsculas, números y guiones bajos.")}
                                    </span>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label htmlFor="template-language">
                                            {t("Idioma")}
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
                                            {t("Categoría")}
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
                                                        {t(option.label)}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="template-parameter-format">
                                        {t("Formato de parámetros")}
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
                                                {t(option.label)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="template-components">
                                        {t("Components")}
                                    </label>

                                    <textarea
                                        id="template-components"
                                        value={componentsText}
                                        onChange={(event) => setComponentsText(event.target.value)}
                                        placeholder={t('[{"type":"BODY","text":"Hola {{1}}"}]')}
                                        disabled={operationInProgress}
                                        rows="12"
                                        spellCheck="false"
                                        required
                                    />

                                    <span className={styles.fieldHelp}>
                                        {t("Definición normalizada en formato JSON.")}
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
                                                    {t("Estado")}
                                                </span>

                                                <strong>
                                                    {getStatusLabel(selectedTemplate.status)}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    {t("Disponible en Meta")}
                                                </span>

                                                <strong>
                                                    {selectedTemplate.is_available_in_meta
                                                        ? t("Sí")
                                                        : t("No")}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    {t("Última sincronización")}
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
                                                    {t("Motivo de rechazo")}
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
                                                ? t("Eliminando...")
                                                : t("Eliminar")}
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
                                                {t("Cancelar")}
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
                                                ? t("Guardando...")
                                                : selectedTemplate
                                                    ? t("Guardar cambios")
                                                    : t("Enviar a Meta")}
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

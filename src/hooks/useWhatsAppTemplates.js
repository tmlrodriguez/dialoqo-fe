import { useState } from "react";

import { usePageTranslation } from "./usePageTranslation.js";
import { useRequestGuard } from "./useRequestGuard.js";
import { useResourceLifecycle } from "./useResourceLifecycle.js";
import {
    createMessageTemplate,
    deleteMessageTemplate,
    getMessageTemplate,
    getMessageTemplates,
    getWhatsAppBusinessAccounts,
    synchronizeMessageTemplates,
    updateMessageTemplate,
} from "../services/whatsapp.js";
import { getLanguageLocale } from "../utils/i18n.js";

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
 * useWhatsAppTemplates
 * Description: Own the selected company resource, mutations and request lifecycle.
 */
export function useWhatsAppTemplates({ companyId, onError, onSuccess }) {
    const { t } = usePageTranslation();
    const [templateFormVersion, setTemplateFormVersion] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState("");

    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [languageFilter, setLanguageFilter] = useState("");

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

    const loadAccountsGuard = useRequestGuard(companyId);
    const loadTemplatesGuard = useRequestGuard(JSON.stringify([companyId, selectedAccountId]));

    function clearParentMessages() {
        onError?.("");
        onSuccess?.("");
    }

    function resetForm() {
        setSelectedTemplate(null);
        setTemplateFormVersion((current) => current + 1);
    }

    async function loadAccounts() {
        const isCurrentRequest = loadAccountsGuard.begin();
        if (!companyId) {
            setAccounts([]);
            setSelectedAccountId("");
            return;
        }

        setIsLoadingAccounts(true);

        try {
            const response = await getWhatsAppBusinessAccounts(companyId);
            if (!isCurrentRequest()) return;
            const accountList = response?.data || [];

            setAccounts(accountList);

            setSelectedAccountId((currentAccountId) => {
                const accountExists = accountList.some(
                    (account) => String(account.id) === String(currentAccountId),
                );

                if (accountExists) {
                    return currentAccountId;
                }

                return accountList.length > 0 ? String(accountList[0].id) : "";
            });
        } catch (error) {
            if (!isCurrentRequest()) return;
            setAccounts([]);
            setSelectedAccountId("");

            onError?.(
                error.message || t("No fue posible cargar las cuentas de WhatsApp Business."),
            );
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingAccounts(false);
            }
        }
    }

    async function loadTemplates(page = 1) {
        const isCurrentRequest = loadTemplatesGuard.begin();
        if (!companyId || !selectedAccountId) {
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
            const response = await getMessageTemplates(companyId, selectedAccountId, {
                search: search.trim(),
                status: statusFilter,
                category: categoryFilter,
                language: languageFilter.trim(),
                page,
                pageSize: 30,
            });
            if (!isCurrentRequest()) return;

            const responseData = response?.data || {};

            setTemplates(responseData.results || []);

            setPagination({
                count: responseData.count || 0,
                next: responseData.next || null,
                previous: responseData.previous || null,
            });

            setCurrentPage(page);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setTemplates([]);

            setPagination({
                count: 0,
                next: null,
                previous: null,
            });

            onError?.(error.message || t("No fue posible cargar las plantillas de WhatsApp."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingTemplates(false);
            }
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
        if (!companyId || !selectedAccountId || !template?.id || isLoadingDetail) {
            return;
        }

        setIsLoadingDetail(true);
        clearParentMessages();

        try {
            const response = await getMessageTemplate(companyId, selectedAccountId, template.id);

            const templateDetail = response?.data;

            if (!templateDetail) {
                throw new Error(t("No fue posible obtener el detalle de la plantilla."));
            }

            setSelectedTemplate(templateDetail);
            setTemplateFormVersion((current) => current + 1);
        } catch (error) {
            onError?.(error.message || t("No fue posible cargar la plantilla."));
        } finally {
            setIsLoadingDetail(false);
        }
    }

    async function handleSubmit({ name, language, category, parameterFormat, components }) {
        if (!companyId || !selectedAccountId || isSaving) {
            return;
        }

        clearParentMessages();

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
                    updateData,
                );

                onSuccess?.(t("Plantilla actualizada correctamente."));
            } else {
                const createData = {
                    name: name.trim(),
                    language: language.trim(),
                    category,
                    parameter_format: parameterFormat,
                    components,
                };

                await createMessageTemplate(companyId, selectedAccountId, createData);

                onSuccess?.(t("Plantilla enviada a Meta correctamente."));
            }

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(error.message || t("No fue posible guardar la plantilla."));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!companyId || !selectedAccountId || !selectedTemplate || isDeleting) {
            return;
        }

        const confirmed = window.confirm(
            `${t("¿Desea eliminar la plantilla")} "${selectedTemplate.name}" ${t("de Meta?")}`,
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
                selectedTemplate.id,
            );

            onSuccess?.(response?.success_message || t("Plantilla eliminada correctamente."));

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(error.message || t("No fue posible eliminar la plantilla."));
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleSynchronize() {
        if (!companyId || !selectedAccountId || isSynchronizing) {
            return;
        }

        setIsSynchronizing(true);
        clearParentMessages();

        try {
            const response = await synchronizeMessageTemplates(companyId, selectedAccountId);

            onSuccess?.(response?.success_message || t("Plantillas sincronizadas correctamente."));

            resetForm();

            await loadTemplates(1);
        } catch (error) {
            onError?.(error.message || t("No fue posible sincronizar las plantillas con Meta."));
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
        const option = TEMPLATE_STATUSES.find((item) => item.value === status);

        return option?.label ? t(option.label) : status || t("Desconocido");
    }

    function getCategoryLabel(value) {
        const option = TEMPLATE_CATEGORIES.find((item) => item.value === value);

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

    const operationInProgress = isSaving || isDeleting || isSynchronizing;

    useResourceLifecycle(
        () => {
            setAccounts([]);
            setSelectedAccountId("");
            setTemplates([]);

            resetForm();

            loadAccounts();
        },
        JSON.stringify([companyId]),
    );

    useResourceLifecycle(
        () => {
            setTemplates([]);
            setCurrentPage(1);

            resetForm();

            if (selectedAccountId) {
                loadTemplates(1);
            }
        },
        JSON.stringify([selectedAccountId]),
    );

    return {
        templateFormVersion,
        t,
        selectedAccountId,
        handleAccountChange,
        isLoadingAccounts,
        accounts,
        operationInProgress,
        handleSynchronize,
        isSynchronizing,
        handleApplyFilters,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        TEMPLATE_STATUSES,
        categoryFilter,
        setCategoryFilter,
        TEMPLATE_CATEGORIES,
        languageFilter,
        setLanguageFilter,
        handleResetFilters,
        pagination,
        handleNewTemplate,
        isLoadingTemplates,
        templates,
        selectedTemplate,
        handleSelectTemplate,
        isLoadingDetail,
        getCategoryLabel,
        getStatusLabel,
        loadTemplates,
        currentPage,
        handleSubmit,

        PARAMETER_FORMATS,

        formatDateTime,
        handleDelete,
        isDeleting,
        resetForm,
        isSaving,
    };
}

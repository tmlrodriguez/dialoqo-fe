import { useState } from "react";

import { usePageTranslation } from "./usePageTranslation.js";

import { useResourceLifecycle } from "./useResourceLifecycle.js";
import { getAvailableMessageTemplates } from "../services/monitoring.js";

/**
 * TemplatePicker
 *
 * Description:
 * - Permitir seleccionar una plantilla aprobada disponible para el número monitoreado.
 *
 * Notes:
 * - Las plantillas son obtenidas desde el WABA correspondiente al número.
 * - Únicamente las plantillas autorizadas por el backend son mostradas.
 */

/**
 * useTemplatePicker
 * Description: Own monitoring resource state, requests and lifecycle cleanup.
 */
export function useTemplatePicker({
    companyId,
    branchId,
    numberId,
    selectedTemplateId,
    onSelect,
    onClose,
    onError,
}) {
    const { t } = usePageTranslation();
    const [templates, setTemplates] = useState([]);

    const [search, setSearch] = useState("");

    const [isLoading, setIsLoading] = useState(true);

    /**
     * loadTemplates
     *
     * Description:
     * - Obtener las plantillas aprobadas disponibles.
     */
    async function loadTemplates(searchValue = "") {
        if (!companyId || !branchId || !numberId) {
            setTemplates([]);

            return;
        }

        setIsLoading(true);

        try {
            const response = await getAvailableMessageTemplates(companyId, branchId, numberId, {
                search: searchValue.trim(),
                pageSize: 100,
            });

            const responseData = response?.data || {};

            const results = Array.isArray(responseData) ? responseData : responseData.results || [];

            setTemplates(results);
        } catch (error) {
            setTemplates([]);

            onError?.(error.message || t("No fue posible cargar las plantillas."));
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * handleSearchChange
     *
     * Description:
     * - Actualizar el término de búsqueda.
     */
    function handleSearchChange(event) {
        setSearch(event.target.value);
    }

    /**
     * getCategoryLabel
     *
     * Description:
     * - Obtener una representación legible de la categoría.
     */
    function getCategoryLabel(category) {
        switch (category) {
            case "MARKETING":
                return t("Marketing");

            case "UTILITY":
                return "Utilidad";

            case "AUTHENTICATION":
                return t("Autenticación");

            default:
                return category || t("Plantilla");
        }
    }

    useResourceLifecycle(
        () => {
            const timeoutId = window.setTimeout(() => {
                loadTemplates(search);
            }, 250);

            return () => {
                window.clearTimeout(timeoutId);
            };
        },
        JSON.stringify([companyId, branchId, numberId, search]),
    );

    return {
        t,
        onClose,
        search,
        handleSearchChange,
        isLoading,
        templates,
        selectedTemplateId,
        onSelect,
        getCategoryLabel,
    };
}

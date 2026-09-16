import {
    useEffect,
    useState,
} from "react";

import {
    getAvailableMessageTemplates,
} from "../../../services/monitoring.js";

import styles from "./TemplatePicker.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


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
function TemplatePicker({
    companyId,
    branchId,
    numberId,
    selectedTemplateId,
    onSelect,
    onClose,
    onError,
}) {
    const { t } = usePageTranslation();
    const [templates, setTemplates] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(true);


    /**
     * loadTemplates
     *
     * Description:
     * - Obtener las plantillas aprobadas disponibles.
     */
    async function loadTemplates(
        searchValue = ""
    ) {
        if (
            !companyId ||
            !branchId ||
            !numberId
        ) {
            setTemplates([]);

            return;
        }

        setIsLoading(true);

        try {
            const response =
                await getAvailableMessageTemplates(
                    companyId,
                    branchId,
                    numberId,
                    {
                        search:
                            searchValue.trim(),
                        pageSize: 100,
                    }
                );

            const responseData =
                response?.data || {};

            const results =
                Array.isArray(responseData)
                    ? responseData
                    : responseData.results || [];

            setTemplates(
                results
            );
        } catch (error) {
            setTemplates([]);

            onError?.(
                error.message ||
                t("No fue posible cargar las plantillas.")
            );
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
    function handleSearchChange(
        event
    ) {
        setSearch(
            event.target.value
        );
    }


    /**
     * getCategoryLabel
     *
     * Description:
     * - Obtener una representación legible de la categoría.
     */
    function getCategoryLabel(
        category
    ) {
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


    useEffect(() => {
        const timeoutId =
            window.setTimeout(
                () => {
                    loadTemplates(
                        search
                    );
                },
                250
            );

        return () => {
            window.clearTimeout(
                timeoutId
            );
        };
    }, [
        companyId,
        branchId,
        numberId,
        search,
    ]);


    return (
        <section className={styles.picker}>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>
                        WhatsApp
                    </span>

                    <h3>
                        Seleccionar plantilla
                    </h3>

                    <p>
                        Seleccione una plantilla aprobada para enviarla en esta conversación.
                    </p>
                </div>

                <button
                    className={styles.closeButton}
                    type="button"
                    onClick={onClose}
                    aria-label={t("Cerrar selector de plantillas")}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m6 6 12 12" />
                        <path d="m18 6-12 12" />
                    </svg>
                </button>
            </header>

            <div className={styles.searchContainer}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle
                        cx="11"
                        cy="11"
                        r="7"
                    />

                    <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                    type="search"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t("Buscar plantilla...")}
                />
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <span className={styles.spinner}></span>

                        <span>
                            Cargando plantillas...
                        </span>
                    </div>
                ) : templates.length === 0 ? (
                    <div className={styles.emptyState}>
                        <strong>
                            No existen plantillas disponibles.
                        </strong>

                        <span>
                            No se encontraron plantillas aprobadas para este número.
                        </span>
                    </div>
                ) : (
                    templates.map(
                        (template) => (
                            <button
                                key={template.id}
                                className={`${styles.templateCard} ${
                                    String(
                                        selectedTemplateId
                                    ) ===
                                    String(
                                        template.id
                                    )
                                        ? styles.templateCardSelected
                                        : ""
                                }`}
                                type="button"
                                onClick={() =>
                                    onSelect?.(
                                        template
                                    )
                                }
                            >
                                <div className={styles.templateIdentity}>
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
                                            <path d="M4 5h16v14H4Z" />
                                            <path d="M8 9h8" />
                                            <path d="M8 13h5" />
                                        </svg>
                                    </div>

                                    <div>
                                        <strong>
                                            {template.name}
                                        </strong>

                                        <span>
                                            {template.language}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.badges}>
                                    <span className={styles.categoryBadge}>
                                        {getCategoryLabel(
                                            template.category
                                        )}
                                    </span>

                                    <span className={styles.approvedBadge}>
                                        Aprobada
                                    </span>
                                </div>
                            </button>
                        )
                    )
                )}
            </div>
        </section>
    );
}


export default TemplatePicker;

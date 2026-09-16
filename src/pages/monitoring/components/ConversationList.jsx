import { useEffect, useState } from "react";

import {
    getConversations,
} from "../../../services/monitoring.js";

import ConversationListItem from "./ConversationListItem.jsx";

import styles from "./ConversationList.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * ConversationList
 *
 * Description:
 * - Obtener y renderizar las conversaciones pertenecientes al contexto seleccionado.
 *
 * Notes:
 * - Las conversaciones son obtenidas mediante el endpoint paginado del backend.
 * - Soporta búsqueda y filtrado de conversaciones no leídas.
 * - Cada cambio de empresa, sucursal o número reinicia la selección.
 * - refreshKey permite recargar la lista cuando cambia el estado de una conversación.
 */
function ConversationList({
    companyId,
    branchId,
    numberId,
    selectedConversationId,
    refreshKey,
    onConversationSelect,
    onError,
}) {
    const { t } = usePageTranslation();
    const [conversations, setConversations] = useState([]);

    const [search, setSearch] = useState("");
    const [unreadOnly, setUnreadOnly] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    });

    const [isLoading, setIsLoading] = useState(false);


    /**
     * loadConversations
     *
     * Description:
     * - Obtener las conversaciones pertenecientes al número seleccionado.
     *
     * Notes:
     * - Mantiene la página solicitada.
     * - Respeta los filtros actualmente seleccionados.
     */
    async function loadConversations(page = 1) {
        if (
            !companyId ||
            !branchId ||
            !numberId
        ) {
            setConversations([]);

            setPagination({
                count: 0,
                next: null,
                previous: null,
            });

            setCurrentPage(1);

            return;
        }

        setIsLoading(true);

        try {
            const response = await getConversations(
                companyId,
                branchId,
                numberId,
                {
                    search: search.trim(),
                    unread: unreadOnly
                        ? "true"
                        : "",
                    ordering: "-last_message_at",
                    page,
                    pageSize: 30,
                }
            );

            const responseData =
                response?.data || {};

            const conversationList =
                responseData.results || [];

            setConversations(
                conversationList
            );

            setPagination({
                count: responseData.count || 0,
                next: responseData.next || null,
                previous: responseData.previous || null,
            });

            setCurrentPage(page);
        } catch (error) {
            setConversations([]);

            setPagination({
                count: 0,
                next: null,
                previous: null,
            });

            onError?.(
                error.message ||
                t("No fue posible cargar las conversaciones.")
            );
        } finally {
            setIsLoading(false);
        }
    }


    /**
     * handleSearchSubmit
     *
     * Description:
     * - Aplicar la búsqueda de conversaciones.
     *
     * Notes:
     * - La búsqueda reinicia la paginación.
     * - La conversación actualmente seleccionada se limpia.
     */
    function handleSearchSubmit(event) {
        event.preventDefault();

        onConversationSelect?.(null);

        loadConversations(1);
    }


    /**
     * handleUnreadFilter
     *
     * Description:
     * - Cambiar entre todas las conversaciones y conversaciones no leídas.
     *
     * Notes:
     * - El nuevo filtro provoca una recarga mediante useEffect.
     */
    function handleUnreadFilter(value) {
        if (value === unreadOnly) {
            return;
        }

        onConversationSelect?.(null);

        setUnreadOnly(value);
        setCurrentPage(1);
    }


    /**
     * handleConversationClick
     *
     * Description:
     * - Seleccionar una conversación del listado.
     */
    function handleConversationClick(conversation) {
        onError?.("");

        onConversationSelect?.(
            conversation
        );
    }


    /**
     * handlePreviousPage
     *
     * Description:
     * - Cargar la página anterior.
     */
    function handlePreviousPage() {
        if (
            !pagination.previous ||
            currentPage <= 1 ||
            isLoading
        ) {
            return;
        }

        onConversationSelect?.(null);

        loadConversations(
            currentPage - 1
        );
    }


    /**
     * handleNextPage
     *
     * Description:
     * - Cargar la página siguiente.
     */
    function handleNextPage() {
        if (
            !pagination.next ||
            isLoading
        ) {
            return;
        }

        onConversationSelect?.(null);

        loadConversations(
            currentPage + 1
        );
    }


    useEffect(() => {
        setSearch("");
        setUnreadOnly(false);
        setCurrentPage(1);

        setConversations([]);

        setPagination({
            count: 0,
            next: null,
            previous: null,
        });

        onConversationSelect?.(null);

        if (
            companyId &&
            branchId &&
            numberId
        ) {
            loadConversations(1);
        }
    }, [
        companyId,
        branchId,
        numberId,
    ]);


    useEffect(() => {
        if (
            companyId &&
            branchId &&
            numberId
        ) {
            loadConversations(1);
        }
    }, [unreadOnly]);


    useEffect(() => {
        if (
            companyId &&
            branchId &&
            numberId &&
            refreshKey > 0
        ) {
            loadConversations(
                currentPage
            );
        }
    }, [refreshKey]);


    return (
        <section className={styles.conversationList}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>
                        {t("Monitoreo")}
                    </span>

                    <h2>
                        {t("Conversaciones")}
                    </h2>
                </div>

                <span
                    className={styles.count}
                    title={`${pagination.count} conversaciones`}
                >
                    {pagination.count > 999
                        ? "999+"
                        : pagination.count}
                </span>
            </div>

            <form
                className={styles.searchForm}
                onSubmit={handleSearchSubmit}
            >
                <div className={styles.searchField}>
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
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder={t("Buscar cliente o número...")}
                        aria-label={t("Buscar conversaciones")}
                    />
                </div>

                <button
                    className={styles.searchButton}
                    type="submit"
                    disabled={isLoading}
                >
                    {t("Buscar")}
                </button>
            </form>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterButton} ${
                        !unreadOnly
                            ? styles.filterButtonActive
                            : ""
                    }`}
                    type="button"
                    onClick={() =>
                        handleUnreadFilter(false)
                    }
                    disabled={isLoading}
                >
                    {t("Todas")}
                </button>

                <button
                    className={`${styles.filterButton} ${
                        unreadOnly
                            ? styles.filterButtonActive
                            : ""
                    }`}
                    type="button"
                    onClick={() =>
                        handleUnreadFilter(true)
                    }
                    disabled={isLoading}
                >
                    {t("No leídas")}
                </button>
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>

                        <span>
                            Cargando conversaciones...
                        </span>
                    </div>
                ) : conversations.length === 0 ? (
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
                                <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
                                <path d="M8 10h8" />
                                <path d="M8 14h5" />
                            </svg>
                        </div>

                        <strong>
                            No existen conversaciones.
                        </strong>

                        <span>
                            {unreadOnly
                                ? t("No existen conversaciones pendientes de lectura.")
                                : search.trim()
                                    ? t("No se encontraron conversaciones que coincidan con la búsqueda.")
                                    : t("Las conversaciones aparecerán cuando exista actividad en este número.")}
                        </span>
                    </div>
                ) : (
                    conversations.map(
                        (conversation) => (
                            <ConversationListItem
                                key={conversation.id}
                                conversation={conversation}
                                isSelected={
                                    String(
                                        selectedConversationId
                                    ) ===
                                    String(
                                        conversation.id
                                    )
                                }
                                onClick={() =>
                                    handleConversationClick(
                                        conversation
                                    )
                                }
                            />
                        )
                    )
                )}
            </div>

            {(pagination.next ||
                pagination.previous) && (
                <div className={styles.pagination}>
                    <button
                        type="button"
                        disabled={
                            !pagination.previous ||
                            isLoading
                        }
                        onClick={
                            handlePreviousPage
                        }
                    >
                        {t("Anterior")}
                    </button>

                    <span>
                        Página {currentPage}
                    </span>

                    <button
                        type="button"
                        disabled={
                            !pagination.next ||
                            isLoading
                        }
                        onClick={
                            handleNextPage
                        }
                    >
                        {t("Siguiente")}
                    </button>
                </div>
            )}
        </section>
    );
}

export default ConversationList;

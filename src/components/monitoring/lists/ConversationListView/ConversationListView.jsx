import Button from "../../../common/buttons/Button/Button.jsx";

import SectionTabs from "../../../common/navigation/SectionTabs/SectionTabs.jsx";
import ConversationItemsList from "../ConversationItemsList/ConversationItemsList.jsx";
import ConversationSearchForm from "../../forms/ConversationSearchForm/ConversationSearchForm.jsx";

import styles from "./ConversationListView.module.css";

/**
 * ConversationListView
 * Description: Render monitoring state and delegate resource operations to its controller.
 */
function ConversationListView({
    t,
    pagination,
    handleSearchSubmit,
    search,
    setSearch,
    isLoading,
    unreadOnly,
    handleUnreadFilter,
    conversations,
    selectedConversationId,
    handleConversationClick,
    handlePreviousPage,
    currentPage,
    handleNextPage,
}) {
    return (
        <section className={styles.conversationList}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>{t("Monitoreo")}</span>

                    <h2>{t("Conversaciones")}</h2>
                </div>

                <span
                    className={styles.count}
                    title={`${pagination.count} ${t("Conversaciones").toLowerCase()}`}
                >
                    {pagination.count > 999 ? "999+" : pagination.count}
                </span>
            </div>

            <ConversationSearchForm
                handleSearchSubmit={handleSearchSubmit}
                search={search}
                setSearch={setSearch}
                t={t}
                isLoading={isLoading}
            />

            <SectionTabs
                className={styles.filters}
                tabClassName={styles.filterButton}
                activeTabClassName={styles.filterButtonActive}
                sections={[
                    { id: "all", label: t("Todas"), disabled: isLoading },
                    { id: "unread", label: t("No leídas"), disabled: isLoading },
                ]}
                activeSection={unreadOnly ? "unread" : "all"}
                onChange={(value) => handleUnreadFilter(value === "unread")}
            />

            <div className={styles.list}>
                {isLoading && conversations.length === 0 ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>

                        <span>{t("Cargando conversaciones...")}</span>
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

                        <strong>{t("No existen conversaciones.")}</strong>

                        <span>
                            {unreadOnly
                                ? t("No existen conversaciones pendientes de lectura.")
                                : search.trim()
                                  ? t(
                                        "No se encontraron conversaciones que coincidan con la búsqueda.",
                                    )
                                  : t(
                                        "Las conversaciones aparecerán cuando exista actividad en este número.",
                                    )}
                        </span>
                    </div>
                ) : (
                    <ConversationItemsList
                        items={conversations}
                        selectedConversationId={selectedConversationId}
                        handleConversationClick={handleConversationClick}
                    />
                )}
            </div>

            {(pagination.next || pagination.previous) && (
                <div className={styles.pagination}>
                    <Button
                        variant="unstyled"
                        type="button"
                        disabled={!pagination.previous || isLoading}
                        onClick={handlePreviousPage}
                    >
                        {t("Anterior")}
                    </Button>

                    <span>Página {currentPage}</span>

                    <Button
                        variant="unstyled"
                        type="button"
                        disabled={!pagination.next || isLoading}
                        onClick={handleNextPage}
                    >
                        {t("Siguiente")}
                    </Button>
                </div>
            )}
        </section>
    );
}

export default ConversationListView;

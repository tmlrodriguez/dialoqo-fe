import Button from "../../../common/buttons/Button/Button.jsx";
import MessageTimelineList from "../MessageTimelineList/MessageTimelineList.jsx";

import styles from "./MessageListView.module.css";

/**
 * MessageListView
 * Description: Keep the scroll viewport mounted while messages, media and history change.
 */
function MessageListView({
    isLoading,
    t,
    messages,
    listRef,
    contentRef,
    handleScroll,
    handleContentResize,
    newMessageCount,
    scrollToBottom,
    hasOlderMessages,
    loadOlderMessages,
    isLoadingOlder,
    isDifferentDay,
    formatDateDivider,
    companyId,
    branchId,
    numberId,
    conversationId,
}) {
    return (
        <div className={styles.messageViewport}>
            <div
                ref={listRef}
                className={styles.messageList}
                onScroll={handleScroll}
                onLoadCapture={handleContentResize}
            >
                <div ref={contentRef} className={styles.messageContent}>
                    {isLoading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            <span>{t("Cargando mensajes...")}</span>
                        </div>
                    ) : messages.length === 0 ? (
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
                                </svg>
                            </div>
                            <strong>{t("No existen mensajes.")}</strong>
                            <span>Esta conversación todavía no contiene mensajes almacenados.</span>
                        </div>
                    ) : (
                        <>
                            {hasOlderMessages && (
                                <div className={styles.loadOlderContainer}>
                                    <Button
                                        variant="unstyled"
                                        type="button"
                                        onClick={loadOlderMessages}
                                        disabled={isLoadingOlder}
                                    >
                                        {isLoadingOlder
                                            ? t("Cargando...")
                                            : "Cargar mensajes anteriores"}
                                    </Button>
                                </div>
                            )}
                            <MessageTimelineList
                                items={messages}
                                isDifferentDay={isDifferentDay}
                                formatDateDivider={formatDateDivider}
                                companyId={companyId}
                                branchId={branchId}
                                numberId={numberId}
                                conversationId={conversationId}
                            />
                        </>
                    )}
                </div>
            </div>
            {newMessageCount > 0 && (
                <Button
                    variant="primary"
                    className={styles.newMessagesButton}
                    type="button"
                    onClick={scrollToBottom}
                    aria-live="polite"
                >
                    {t("Nuevos mensajes")} ({newMessageCount}) ↓
                </Button>
            )}
        </div>
    );
}

export default MessageListView;

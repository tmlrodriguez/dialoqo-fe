import Button from "../../../common/buttons/Button/Button.jsx";
import ConversationList from "../../lists/ConversationList/ConversationList.jsx";
import ConversationPanel from "../../panels/ConversationPanel/ConversationPanel.jsx";
import NewConversationPanel from "../../panels/NewConversationPanel/NewConversationPanel.jsx";

import styles from "./MonitoringWorkspaceView.module.css";

/**
 * MonitoringWorkspaceView
 * Description: Render monitoring state and delegate resource operations to its controller.
 */
function MonitoringWorkspaceView({
    onChangeNumber,
    t,
    number,
    company,
    branch,
    isRealtimeConnected,
    canStartConversations,
    clearRealtimeError,
    setIsNewConversationOpen,
    selectedConversation,
    events,
    handleConversationSelect,
    onError,
    canSendMessages,
    handleConversationBack,
    handleMessageSent,
    isNewConversationOpen,
    handleNewConversationCreated,
}) {
    return (
        <section className={styles.workspace}>
            <header className={styles.workspaceHeader}>
                <div className={styles.workspaceIdentity}>
                    {onChangeNumber && (
                        <Button
                            className={styles.backButton}
                            type="button"
                            onClick={onChangeNumber}
                            aria-label={t("Cambiar número")}
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
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Button>
                    )}

                    <div className={styles.numberIcon}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="6" y="2.5" width="12" height="19" rx="2" />

                            <path d="M10 18h4" />
                        </svg>
                    </div>

                    <div className={styles.numberInformation}>
                        <strong>{number?.display_name || "WhatsApp"}</strong>

                        <span>{number?.phone_number || ""}</span>
                    </div>
                </div>

                <div className={styles.workspaceContext}>
                    <div>
                        <span>{t("Empresa")}</span>

                        <strong>{company?.name || "—"}</strong>
                    </div>

                    <div>
                        <span>{t("Sucursal")}</span>

                        <strong>{branch?.name || "—"}</strong>
                    </div>

                    <div className={styles.statuses}>
                        {number?.is_connected && (
                            <span className={styles.connectedBadge}>{t("Conectado")}</span>
                        )}

                        {number?.is_monitoring_enabled && (
                            <span className={styles.monitoringBadge}>{t("Monitoreando")}</span>
                        )}

                        <span
                            title={t(
                                "La conexión en tiempo real permite que nuevos mensajes y cambios aparezcan sin recargar la página.",
                            )}
                            className={
                                isRealtimeConnected
                                    ? styles.realtimeConnectedBadge
                                    : styles.realtimeDisconnectedBadge
                            }
                        >
                            {isRealtimeConnected
                                ? t("Tiempo real activo")
                                : t("Tiempo real desconectado")}
                        </span>

                        {canStartConversations && (
                            <Button
                                className={styles.newConversationButton}
                                type="button"
                                onClick={() => {
                                    clearRealtimeError();
                                    setIsNewConversationOpen(true);
                                }}
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
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>

                                {t("Nueva conversación")}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div
                className={`${styles.workspaceBody} ${selectedConversation ? styles.workspaceBodyConversationOpen : styles.workspaceBodyConversationList}`}
            >
                <div className={styles.conversationListPane}>
                    <ConversationList
                        companyId={company?.id}
                        branchId={branch?.id}
                        numberId={number?.id}
                        selectedConversationId={selectedConversation?.id}
                        events={events}
                        onConversationSelect={handleConversationSelect}
                        onError={onError}
                    />
                </div>

                <div className={styles.conversationPane}>
                    <ConversationPanel
                        key={selectedConversation?.id || "empty"}
                        companyId={company?.id}
                        branchId={branch?.id}
                        numberId={number?.id}
                        conversation={selectedConversation}
                        canSendMessages={canSendMessages}
                        events={events}
                        onBack={handleConversationBack}
                        onMessageSent={handleMessageSent}
                        onError={onError}
                    />
                </div>
            </div>

            {canStartConversations && isNewConversationOpen && (
                <NewConversationPanel
                    companyId={company?.id}
                    branchId={branch?.id}
                    numberId={number?.id}
                    onClose={() => setIsNewConversationOpen(false)}
                    onConversationCreated={handleNewConversationCreated}
                    onError={onError}
                />
            )}
        </section>
    );
}

export default MonitoringWorkspaceView;

import Button from "../../../common/buttons/Button/Button.jsx";
import MessageComposer from "../../forms/MessageComposer/MessageComposer.jsx";

import MessageList from "../../lists/MessageList/MessageList.jsx";

import styles from "./ConversationPanelView.module.css";

/**
 * ConversationPanelView
 * Description: Render monitoring state and delegate resource operations to its controller.
 */
function ConversationPanelView({
    conversation,
    t,
    canSendMessages,
    getAssignmentName,
    events,
    onBack,
    getCustomerName,
    companyId,
    branchId,
    numberId,
    onError,
    handleMessageSent,
}) {
    if (!conversation) {
        return (
            <div className={styles.emptyPanel}>
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

                <span className={styles.eyebrow}>{t("Conversaciones")}</span>

                <h2>{t("Seleccione una conversación")}</h2>

                <p>
                    {canSendMessages
                        ? t(
                              "Seleccione una conversación del panel izquierdo para consultar su historial y enviar mensajes.",
                          )
                        : t(
                              "Seleccione una conversación del panel izquierdo para consultar su historial.",
                          )}
                </p>
            </div>
        );
    }

    const customer = conversation.customer || {};

    const assignmentName = getAssignmentName();

    return (
        <section className={styles.conversationPanel}>
            <header className={styles.header}>
                <div className={styles.customerIdentity}>
                    {onBack && (
                        <Button
                            className={styles.mobileBackButton}
                            type="button"
                            onClick={onBack}
                            aria-label={t("Regresar a conversaciones")}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Button>
                    )}
                    <div className={styles.avatar}>{getCustomerName().charAt(0).toUpperCase()}</div>

                    <div className={styles.customerInformation}>
                        <strong>{getCustomerName()}</strong>

                        <span>{customer.phone_number || ""}</span>
                    </div>
                </div>

                <div className={styles.headerMetadata}>
                    {assignmentName && (
                        <div className={styles.assignment}>
                            <span>{t("Responsable")}</span>

                            <strong>{assignmentName}</strong>
                        </div>
                    )}
                </div>
            </header>

            <MessageList
                companyId={companyId}
                branchId={branchId}
                numberId={numberId}
                conversationId={conversation.id}
                events={events}
                onError={onError}
            />

            {canSendMessages && (
                <MessageComposer
                    companyId={companyId}
                    branchId={branchId}
                    numberId={numberId}
                    conversationId={conversation.id}
                    onMessageSent={handleMessageSent}
                    onError={onError}
                />
            )}
        </section>
    );
}

export default ConversationPanelView;

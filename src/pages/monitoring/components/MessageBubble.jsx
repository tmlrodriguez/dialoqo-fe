import MessageMedia from "./MessageMedia.jsx";
import MessageSpecialContent from "./MessageSpecialContent.jsx";

import styles from "./MessageBubble.module.css";


const SPECIAL_MESSAGE_TYPES = [
    "LOCATION",
    "CONTACTS",
    "REACTION",
    "BUTTON",
    "INTERACTIVE",
    "ORDER",
    "UNSUPPORTED",
];


/**
 * MessageBubble
 *
 * Description:
 * - Representar visualmente un mensaje de WhatsApp dentro de una conversación.
 *
 * Notes:
 * - Los mensajes inbound y outbound utilizan alineaciones diferentes.
 * - Los mensajes multimedia delegan su representación a MessageMedia.
 * - Los mensajes estructurados delegan su representación a MessageSpecialContent.
 * - Los mensajes revocados nunca muestran contenido original.
 * - Los estados outbound se representan visualmente en la metadata.
 */
function MessageBubble({
    message,
    companyId,
    branchId,
    numberId,
    conversationId,
}) {
    const isOutbound =
        message?.direction === "OUTBOUND";

    const isRevoked =
        Boolean(
            message?.is_revoked
        );

    const messageType =
        String(
            message?.message_type || ""
        ).toUpperCase();

    const mediaAttachments =
        Array.isArray(
            message?.media_attachments
        )
            ? message.media_attachments
            : [];

    const isSpecialMessage =
        SPECIAL_MESSAGE_TYPES.includes(
            messageType
        );


    /**
     * formatTime
     *
     * Description:
     * - Obtener la hora localizada del mensaje.
     */
    function formatTime(
        value
    ) {
        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        return new Intl.DateTimeFormat(
            "es-HN",
            {
                hour: "numeric",
                minute: "2-digit",
            }
        ).format(date);
    }


    /**
     * getStatusLabel
     *
     * Description:
     * - Obtener el texto visible del estado outbound.
     */
    function getStatusLabel() {
        if (!isOutbound) {
            return "";
        }

        switch (
            message?.status
        ) {
            case "PENDING":
                return "Enviando";

            case "SENT":
                return "Enviado";

            case "DELIVERED":
                return "Entregado";

            case "READ":
                return "Leído";

            case "FAILED":
                return "Fallido";

            default:
                return "";
        }
    }


    /**
     * getVisibleText
     *
     * Description:
     * - Obtener el texto seguro que debe mostrarse.
     */
    function getVisibleText() {
        if (isRevoked) {
            return (
                message?.display_text ||
                "Este mensaje fue eliminado."
            );
        }

        return (
            message?.display_text ||
            message?.text_body ||
            ""
        );
    }


    const visibleText =
        getVisibleText();

    const statusLabel =
        getStatusLabel();

    const hasMedia =
        !isRevoked &&
        mediaAttachments.length > 0;

    const showSpecialContent =
        !isRevoked &&
        isSpecialMessage;


    return (
        <div
            className={`${styles.messageRow} ${
                isOutbound
                    ? styles.messageRowOutbound
                    : styles.messageRowInbound
            }`}
        >
            <article
                className={`${styles.bubble} ${
                    isOutbound
                        ? styles.outboundBubble
                        : styles.inboundBubble
                } ${
                    isRevoked
                        ? styles.revokedBubble
                        : ""
                }`}
            >
                {hasMedia && (
                    <div className={styles.mediaList}>
                        {mediaAttachments.map(
                            (
                                attachment
                            ) => (
                                <MessageMedia
                                    key={attachment.id}
                                    companyId={companyId}
                                    branchId={branchId}
                                    numberId={numberId}
                                    conversationId={conversationId}
                                    messageId={message.id}
                                    messageType={messageType}
                                    attachment={attachment}
                                />
                            )
                        )}
                    </div>
                )}

                {showSpecialContent && (
                    <MessageSpecialContent
                        message={message}
                    />
                )}

                {visibleText &&
                    !(
                        isSpecialMessage &&
                        !isRevoked
                    ) && (
                    <div
                        className={
                            isRevoked
                                ? styles.revokedText
                                : styles.messageText
                        }
                    >
                        {isRevoked && (
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
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="m7 7 10 10" />
                            </svg>
                        )}

                        <span>
                            {visibleText}
                        </span>
                    </div>
                )}

                <footer className={styles.metadata}>
                    {message?.is_edited &&
                        !isRevoked && (
                        <span className={styles.editedLabel}>
                            Editado
                        </span>
                    )}

                    <span>
                        {formatTime(
                            message?.message_timestamp
                        )}
                    </span>

                    {statusLabel && (
                        <span
                            className={`${styles.status} ${
                                message?.status === "FAILED"
                                    ? styles.failedStatus
                                    : ""
                            }`}
                        >
                            {statusLabel}
                        </span>
                    )}
                </footer>
            </article>
        </div>
    );
}


export default MessageBubble;
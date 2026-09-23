import styles from "./ConversationListItem.module.css";
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * ConversationListItem
 *
 * Description:
 * - Renderizar una conversación dentro del listado de monitoreo.
 *
 * Notes:
 * - Muestra identidad del cliente, último mensaje, hora y mensajes no leídos.
 * - La conversación seleccionada utiliza un estado visual diferenciado.
 */
function ConversationListItem({
    conversation,
    isSelected,
    onClick,
}) {
    const { t } = usePageTranslation();
    const customer = conversation?.customer || {};
    const lastMessage = conversation?.last_message || null;

    const customerName =
        customer.display_name ||
        customer.profile_name ||
        customer.phone_number ||
        t("Cliente");

    const preview = getMessagePreview(lastMessage);

    const timestamp =
        lastMessage?.message_timestamp ||
        conversation?.last_message_at;

    const unreadCount = conversation?.unread_count || 0;


    /**
     * getMessagePreview
     *
     * Description:
     * - Obtener una representación corta del último mensaje.
     */
    function getMessagePreview(message) {
        if (!message) {
            return t("Sin mensajes todavía.");
        }

        if (message.is_revoked) {
            return "Este mensaje fue eliminado.";
        }

        if (message.display_text) {
            return message.display_text;
        }

        if (message.text_body) {
            return message.text_body;
        }

        switch (message.message_type) {
            case "IMAGE":
                return t("Imagen");

            case "AUDIO":
                return t("Audio");

            case "VIDEO":
                return t("Video");

            case "DOCUMENT":
                return "Documento";

            case "STICKER":
                return "Sticker";

            case "LOCATION":
                return t("Ubicación");

            case "CONTACTS":
                return t("Contacto");

            case "TEMPLATE":
                return t("Plantilla");

            case "REACTION":
                return t(t("Reacción"));

            default:
                return t("Mensaje");
        }
    }


    /**
     * formatConversationTime
     *
     * Description:
     * - Convertir la fecha del último mensaje en una representación compacta.
     */
    function formatConversationTime(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const now = new Date();

        const sameDay =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();

        if (sameDay) {
            return new Intl.DateTimeFormat(getLanguageLocale(), {
                hour: "numeric",
                minute: "2-digit",
            }).format(date);
        }

        return new Intl.DateTimeFormat(getLanguageLocale(), {
            day: "2-digit",
            month: "2-digit",
        }).format(date);
    }


    return (
        <button
            className={`${styles.conversationItem} ${
                isSelected
                    ? styles.conversationItemActive
                    : ""
            }`}
            type="button"
            onClick={onClick}
        >
            <div className={styles.avatar}>
                {customerName
                    .charAt(0)
                    .toUpperCase()}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <strong className={styles.customerName}>
                        {customerName}
                    </strong>

                    <span className={styles.time}>
                        {formatConversationTime(timestamp)}
                    </span>
                </div>

                <div className={styles.footer}>
                    <span
                        className={`${styles.preview} ${
                            unreadCount > 0
                                ? styles.previewUnread
                                : ""
                        }`}
                    >
                        {lastMessage?.direction === "OUTBOUND" && (
                            <span className={styles.outboundIndicator}>
                                Tú:{" "}
                            </span>
                        )}

                        {preview}
                    </span>

                    {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
                            {unreadCount > 99
                                ? "99+"
                                : unreadCount}
                        </span>
                    )}
                </div>

                {conversation?.current_assignment?.member && (
                    <span className={styles.assignment}>
                        {[
                            conversation.current_assignment.member.first_name,
                            conversation.current_assignment.member.last_name,
                        ]
                            .filter(Boolean)
                            .join(" ") ||
                            conversation.current_assignment.member.member_code}
                    </span>
                )}
            </div>
        </button>
    );
}

export default ConversationListItem;

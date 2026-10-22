import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";

import ButtonMessageContent from "../ButtonMessageContent/ButtonMessageContent.jsx";
import ContactMessageContent from "../ContactMessageContent/ContactMessageContent.jsx";
import InteractiveMessageContent from "../InteractiveMessageContent/InteractiveMessageContent.jsx";
import LocationMessageContent from "../LocationMessageContent/LocationMessageContent.jsx";
import OrderMessageContent from "../OrderMessageContent/OrderMessageContent.jsx";
import ReactionMessageContent from "../ReactionMessageContent/ReactionMessageContent.jsx";
import UnsupportedContent from "../UnsupportedContent/UnsupportedContent.jsx";

/**
 * MessageSpecialContent
 *
 * Description:
 * - Renderizar contenido estructurado de mensajes WhatsApp que no corresponde
 *   directamente a texto o archivos multimedia.
 *
 * Notes:
 * - Utiliza exclusivamente content_data normalizado por el backend.
 * - Soporta ubicación, contactos, reacciones, botones, mensajes interactivos,
 *   pedidos y contenido no soportado.
 * - No realiza operaciones de escritura ni solicitudes HTTP adicionales.
 */
function MessageSpecialContent({ message }) {
    const { t } = usePageTranslation();
    const messageType = String(message?.message_type || "").toUpperCase();

    const contentData =
        message?.content_data && typeof message.content_data === "object"
            ? message.content_data
            : {};

    if (messageType === "LOCATION") {
        return <LocationMessageContent contentData={contentData} t={t} />;
    }

    if (messageType === "CONTACTS") {
        return <ContactMessageContent contentData={contentData} t={t} />;
    }

    if (messageType === "REACTION") {
        return <ReactionMessageContent contentData={contentData} t={t} message={message} />;
    }

    if (messageType === "BUTTON") {
        return <ButtonMessageContent contentData={contentData} t={t} />;
    }

    if (messageType === "INTERACTIVE") {
        return <InteractiveMessageContent contentData={contentData} t={t} />;
    }

    if (messageType === "ORDER") {
        return <OrderMessageContent contentData={contentData} t={t} />;
    }

    if (messageType === "UNSUPPORTED") {
        return (
            <UnsupportedContent
                title={t("Tipo de mensaje no soportado")}
                description={t(
                    "CentralChat conservó el evento, pero todavía no dispone de una representación especializada.",
                )}
            />
        );
    }

    return null;
}

export default MessageSpecialContent;

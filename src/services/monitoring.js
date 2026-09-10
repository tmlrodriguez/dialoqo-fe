import {
    API_BASE_URL,
    apiRequest,
} from "../api/client.js";


/**
 * getMonitoringContext
 *
 * Description:
 * - Obtener el contexto operativo disponible para el monitor autenticado.
 */
export function getMonitoringContext() {
    return apiRequest(
        "/whatsapp/monitoring/context/"
    );
}


/**
 * getConversations
 *
 * Description:
 * - Obtener las conversaciones pertenecientes a un número de WhatsApp.
 */
export function getConversations(
    companyId,
    branchId,
    numberId,
    params = {}
) {
    const queryParams =
        new URLSearchParams();

    if (params.search) {
        queryParams.set(
            "search",
            params.search
        );
    }

    if (
        params.unread !== undefined &&
        params.unread !== null &&
        params.unread !== ""
    ) {
        queryParams.set(
            "unread",
            params.unread
        );
    }

    if (params.memberId) {
        queryParams.set(
            "member_id",
            params.memberId
        );
    }

    if (params.ordering) {
        queryParams.set(
            "ordering",
            params.ordering
        );
    }

    if (params.page) {
        queryParams.set(
            "page",
            params.page
        );
    }

    if (params.pageSize) {
        queryParams.set(
            "page_size",
            params.pageSize
        );
    }

    const queryString =
        queryParams.toString();

    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/conversations/${queryString ? `?${queryString}` : ""}`
    );
}


/**
 * getConversation
 *
 * Description:
 * - Obtener el detalle de una conversación monitoreada.
 */
export function getConversation(
    companyId,
    branchId,
    numberId,
    conversationId
) {
    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/conversations/${conversationId}/`
    );
}


/**
 * markConversationAsRead
 *
 * Description:
 * - Marcar una conversación como leída para el monitor autenticado.
 */
export function markConversationAsRead(
    companyId,
    branchId,
    numberId,
    conversationId
) {
    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/conversations/${conversationId}/read/`,
        {
            method: "POST",
        }
    );
}


/**
 * getMessages
 *
 * Description:
 * - Obtener el historial paginado de mensajes de una conversación.
 */
export function getMessages(
    companyId,
    branchId,
    numberId,
    conversationId,
    params = {}
) {
    const queryParams =
        new URLSearchParams();

    if (params.ordering) {
        queryParams.set(
            "ordering",
            params.ordering
        );
    }

    if (params.page) {
        queryParams.set(
            "page",
            params.page
        );
    }

    if (params.pageSize) {
        queryParams.set(
            "page_size",
            params.pageSize
        );
    }

    const queryString =
        queryParams.toString();

    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/conversations/${conversationId}/messages/${queryString ? `?${queryString}` : ""}`
    );
}


/**
 * sendTextMessage
 *
 * Description:
 * - Enviar un mensaje de texto desde una conversación monitoreada.
 */
export function sendTextMessage(
    companyId,
    branchId,
    numberId,
    conversationId,
    textBody
) {
    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/conversations/${conversationId}/messages/send/`,
        {
            method: "POST",
            body: JSON.stringify({
                text_body: textBody,
            }),
        }
    );
}


/**
 * getAvailableMessageTemplates
 *
 * Description:
 * - Obtener las plantillas aprobadas disponibles para un número de WhatsApp.
 *
 * Notes:
 * - Las plantillas pertenecen exclusivamente al WABA asociado al número.
 * - El backend restringe el resultado a plantillas disponibles y aprobadas.
 */
export function getAvailableMessageTemplates(
    companyId,
    branchId,
    numberId,
    params = {}
) {
    const queryParams =
        new URLSearchParams();

    if (params.search) {
        queryParams.set(
            "search",
            params.search
        );
    }

    if (params.category) {
        queryParams.set(
            "category",
            params.category
        );
    }

    if (params.language) {
        queryParams.set(
            "language",
            params.language
        );
    }

    if (params.page) {
        queryParams.set(
            "page",
            params.page
        );
    }

    if (params.pageSize) {
        queryParams.set(
            "page_size",
            params.pageSize
        );
    }

    const queryString =
        queryParams.toString();

    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/templates/${queryString ? `?${queryString}` : ""}`
    );
}


/**
 * sendConversationTemplate
 *
 * Description:
 * - Enviar una plantilla aprobada dentro de una conversación existente.
 */
export function sendConversationTemplate(
    companyId,
    branchId,
    numberId,
    conversationId,
    templateId,
    components = []
) {
    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/conversations/${conversationId}/templates/send/`,
        {
            method: "POST",
            body: JSON.stringify({
                template_id:
                    templateId,

                components,
            }),
        }
    );
}


/**
 * startConversationWithTemplate
 *
 * Description:
 * - Iniciar o reutilizar una conversación mediante una plantilla aprobada.
 *
 * Notes:
 * - El destinatario es proporcionado explícitamente por el monitor.
 * - La plantilla debe pertenecer al WABA asociado al número origen.
 * - Customer y Conversation se crean únicamente después de que Meta acepta el mensaje.
 */
export function startConversationWithTemplate(
    companyId,
    branchId,
    numberId,
    recipientPhoneNumber,
    templateId,
    components = []
) {
    return apiRequest(
        `/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/templates/send/`,
        {
            method: "POST",

            body: JSON.stringify({
                recipient_phone_number:
                    recipientPhoneNumber,

                template_id:
                    templateId,

                components,
            }),
        }
    );
}


/**
 * getMediaAttachmentContent
 *
 * Description:
 * - Obtener el contenido binario privado de un adjunto multimedia.
 *
 * Notes:
 * - Utiliza el mismo token DRF del resto del frontend.
 * - El contenido se devuelve como Blob.
 * - storage_key nunca se expone al cliente.
 */
export async function getMediaAttachmentContent(
    companyId,
    branchId,
    numberId,
    conversationId,
    messageId,
    attachmentId
) {
    const token =
        localStorage.getItem(
            "centralchat_token"
        );

    const response =
        await fetch(
            `${API_BASE_URL}/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}/content/`,
            {
                method: "GET",

                headers: token
                    ? {
                        Authorization:
                            `Token ${token}`,
                    }
                    : {},
            }
        );

    if (!response.ok) {
        let data = null;

        try {
            data =
                await response.json();
        } catch {
            data = null;
        }

        const error =
            new Error(
                data?.error_message ||
                "No fue posible obtener el archivo multimedia."
            );

        error.status =
            response.status;

        error.data =
            data;

        throw error;
    }

    return response.blob();
}
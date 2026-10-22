import { useKeyedState } from "./useKeyedState.js";
import { usePageTranslation } from "./usePageTranslation.js";
import { useRequestGuard } from "./useRequestGuard.js";

import { sendConversationTemplate, sendTextMessage } from "../services/monitoring.js";

/**
 * MessageComposer
 *
 * Description:
 * - Permitir a un usuario MEMBER enviar mensajes de texto o plantillas aprobadas.
 *
 * Notes:
 * - El destinatario y número origen son determinados por la conversación.
 * - Las plantillas son obtenidas exclusivamente desde el WABA asociado al número.
 * - Este componente no se renderiza para usuarios MONITOR.
 * - Los envíos permanecen autorizados y validados por el backend.
 */

/**
 * useMessageComposer
 * Description: Own monitoring resource state, requests and lifecycle cleanup.
 */
export function useMessageComposer({
    companyId,
    branchId,
    numberId,
    conversationId,
    onMessageSent,
    onError,
}) {
    const { t } = usePageTranslation();
    const resourceKey = JSON.stringify([companyId, branchId, numberId, conversationId]);
    const sendGuard = useRequestGuard(resourceKey);

    const [isSending, setIsSending] = useKeyedState(false, resourceKey);

    const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useKeyedState(false, resourceKey);

    const [selectedTemplate, setSelectedTemplate] = useKeyedState(null, resourceKey);

    /**
     * closeTemplatePanel
     *
     * Description:
     * - Cerrar y restablecer el selector de plantillas.
     */
    function closeTemplatePanel() {
        if (isSending) {
            return;
        }

        setIsTemplatePanelOpen(false);

        setSelectedTemplate(null);
    }

    /**
     * handleTextSubmit
     *
     * Description:
     * - Enviar un mensaje de texto.
     */
    async function handleTextSubmit(textBody) {
        const normalizedText = textBody.trim();

        if (
            !normalizedText ||
            !companyId ||
            !branchId ||
            !numberId ||
            !conversationId ||
            isSending
        ) {
            return;
        }

        const isCurrent = sendGuard.begin();
        setIsSending(true);

        onError?.("");

        try {
            const response = await sendTextMessage(
                companyId,
                branchId,
                numberId,
                conversationId,
                normalizedText,
            );

            if (!isCurrent()) return;
            onMessageSent?.(response?.data || null, conversationId);
            return true;
        } catch (error) {
            if (isCurrent()) onError?.(error.message || t("No fue posible enviar el mensaje."));
        } finally {
            if (isCurrent()) setIsSending(false);
        }
    }

    /**
     * handleTemplateSubmit
     *
     * Description:
     * - Enviar la plantilla seleccionada con sus parámetros dinámicos.
     */
    async function handleTemplateSubmit(components) {
        if (
            !selectedTemplate?.id ||
            !companyId ||
            !branchId ||
            !numberId ||
            !conversationId ||
            isSending
        ) {
            return;
        }

        const isCurrent = sendGuard.begin();
        setIsSending(true);

        onError?.("");

        try {
            const response = await sendConversationTemplate(
                companyId,
                branchId,
                numberId,
                conversationId,
                selectedTemplate.id,
                components,
            );

            if (!isCurrent()) return;
            const message = response?.data?.message || null;

            // Close the modal first so the successful send always returns the
            // operator to the conversation even if the parent immediately
            // refreshes messages and conversation metadata.
            setIsTemplatePanelOpen(false);
            setSelectedTemplate(null);

            onMessageSent?.(message, conversationId);
        } catch (error) {
            if (isCurrent()) onError?.(error.message || t("No fue posible enviar la plantilla."));
        } finally {
            if (isCurrent()) setIsSending(false);
        }
    }

    return {
        isTemplatePanelOpen,
        selectedTemplate,
        isSending,
        setSelectedTemplate,
        handleTemplateSubmit,
        companyId,
        branchId,
        numberId,
        closeTemplatePanel,
        onError,
        conversationId,
        handleTextSubmit,
        setIsTemplatePanelOpen,
        t,
    };
}

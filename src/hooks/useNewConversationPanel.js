import { useState } from "react";

import { usePageTranslation } from "./usePageTranslation.js";
import { useRequestGuard } from "./useRequestGuard.js";
import { startConversationWithTemplate } from "../services/monitoring.js";

const STEP_RECIPIENT = "recipient";

const STEP_TEMPLATE = "template";

const STEP_PARAMETERS = "parameters";

/**
 * NewConversationPanel
 *
 * Description:
 * - Permitir iniciar una conversación mediante una plantilla aprobada de WhatsApp.
 *
 * Notes:
 * - El número destino se proporciona explícitamente por el monitor.
 * - La plantilla debe pertenecer al WABA del número seleccionado.
 * - Customer y Conversation son creados por el backend solamente después de que Meta acepta el mensaje.
 * - La resolución del tenant nunca depende del número destino.
 */

/**
 * useNewConversationPanel
 * Description: Own monitoring resource state, requests and lifecycle cleanup.
 */
export function useNewConversationPanel({
    companyId,
    branchId,
    numberId,
    onClose,
    onConversationCreated,
    onError,
}) {
    const { t } = usePageTranslation();
    const sendGuard = useRequestGuard(JSON.stringify([companyId, branchId, numberId]));
    const [step, setStep] = useState(STEP_RECIPIENT);

    const [recipientPhoneNumber, setRecipientPhoneNumber] = useState("");

    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [isSending, setIsSending] = useState(false);

    /**
     * normalizePhoneNumber
     *
     * Description:
     * - Normalizar el número destino conservando únicamente dígitos.
     */

    /**
     * handleRecipientSubmit
     *
     * Description:
     * - Validar el número destino y avanzar a selección de plantilla.
     */
    function handleRecipientSubmit(phoneNumber) {
        setRecipientPhoneNumber(phoneNumber);
        onError?.("");
        setStep(STEP_TEMPLATE);
    }

    /**
     * handleTemplateSelect
     *
     * Description:
     * - Seleccionar una plantilla y avanzar a configuración de parámetros.
     */
    function handleTemplateSelect(template) {
        setSelectedTemplate(template);

        setStep(STEP_PARAMETERS);
    }

    /**
     * handleTemplateSend
     *
     * Description:
     * - Enviar la plantilla seleccionada para iniciar o reutilizar la conversación.
     */
    async function handleTemplateSend(components) {
        if (
            !companyId ||
            !branchId ||
            !numberId ||
            !recipientPhoneNumber ||
            !selectedTemplate?.id ||
            isSending
        ) {
            return;
        }

        const isCurrent = sendGuard.begin();
        setIsSending(true);

        onError?.("");

        try {
            const response = await startConversationWithTemplate(
                companyId,
                branchId,
                numberId,
                recipientPhoneNumber,
                selectedTemplate.id,
                components,
            );

            if (!isCurrent()) return;
            const responseData = response?.data || {};

            onConversationCreated?.({
                customerId: responseData.customer_id,

                conversationId: responseData.conversation_id,

                message: responseData.message,
            });
        } catch (error) {
            if (isCurrent())
                onError?.(error.message || t("No fue posible iniciar la conversación."));
        } finally {
            if (isCurrent()) setIsSending(false);
        }
    }

    /**
     * renderRecipientStep
     *
     * Description:
     * - Renderizar captura del número destino.
     */

    return {
        step,
        STEP_RECIPIENT,
        t,
        STEP_TEMPLATE,
        STEP_PARAMETERS,
        onClose,
        isSending,
        handleRecipientSubmit,
        recipientPhoneNumber,
        companyId,
        branchId,
        numberId,
        selectedTemplate,
        handleTemplateSelect,
        setStep,
        onError,
        setSelectedTemplate,
        handleTemplateSend,
    };
}

import {
    useEffect,
    useState,
} from "react";

import {
    sendConversationTemplate,
    sendTextMessage,
} from "../../../services/monitoring.js";

import TemplateParameterForm from "./TemplateParameterForm.jsx";
import TemplatePicker from "./TemplatePicker.jsx";

import styles from "./MessageComposer.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


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
function MessageComposer({
    companyId,
    branchId,
    numberId,
    conversationId,
    onMessageSent,
    onError,
}) {
    const { t } = usePageTranslation();
    const [textBody, setTextBody] =
        useState("");

    const [isSending, setIsSending] =
        useState(false);

    const [
        isTemplatePanelOpen,
        setIsTemplatePanelOpen,
    ] = useState(false);

    const [
        selectedTemplate,
        setSelectedTemplate,
    ] = useState(null);


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

        setIsTemplatePanelOpen(
            false
        );

        setSelectedTemplate(
            null
        );
    }


    /**
     * handleTextSubmit
     *
     * Description:
     * - Enviar un mensaje de texto.
     */
    async function handleTextSubmit(
        event
    ) {
        event.preventDefault();

        const normalizedText =
            textBody.trim();

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

        setIsSending(true);

        onError?.("");

        try {
            const response =
                await sendTextMessage(
                    companyId,
                    branchId,
                    numberId,
                    conversationId,
                    normalizedText
                );

            setTextBody("");

            onMessageSent?.(
                response?.data ||
                null
            );
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible enviar el mensaje.")
            );
        } finally {
            setIsSending(false);
        }
    }


    /**
     * handleTemplateSubmit
     *
     * Description:
     * - Enviar la plantilla seleccionada con sus parámetros dinámicos.
     */
    async function handleTemplateSubmit(
        components
    ) {
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

        setIsSending(true);

        onError?.("");

        try {
            const response =
                await sendConversationTemplate(
                    companyId,
                    branchId,
                    numberId,
                    conversationId,
                    selectedTemplate.id,
                    components
                );

            const message =
                response?.data?.message ||
                null;

            // Close the modal first so the successful send always returns the
            // operator to the conversation even if the parent immediately
            // refreshes messages and conversation metadata.
            setIsTemplatePanelOpen(false);
            setSelectedTemplate(null);

            onMessageSent?.(message);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible enviar la plantilla.")
            );
        } finally {
            setIsSending(false);
        }
    }


    /**
     * handleKeyDown
     *
     * Description:
     * - Enviar texto con Enter y permitir salto de línea con Shift + Enter.
     */
    function handleKeyDown(
        event
    ) {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            if (
                textBody.trim() &&
                !isSending
            ) {
                event.currentTarget
                    .closest("form")
                    ?.requestSubmit();
            }
        }
    }


    useEffect(() => {
        setTextBody("");
        setIsTemplatePanelOpen(false);
        setSelectedTemplate(null);
    }, [conversationId]);


    return (
        <div className={styles.composerContainer}>
            {isTemplatePanelOpen && (
                <div className={styles.templateOverlay}>
                    <div className={styles.templatePanel}>
                        {selectedTemplate ? (
                            <TemplateParameterForm
                                template={selectedTemplate}
                                isSending={isSending}
                                onBack={() =>
                                    setSelectedTemplate(
                                        null
                                    )
                                }
                                onSubmit={handleTemplateSubmit}
                            />
                        ) : (
                            <TemplatePicker
                                companyId={companyId}
                                branchId={branchId}
                                numberId={numberId}
                                selectedTemplateId={
                                    selectedTemplate?.id
                                }
                                onSelect={
                                    setSelectedTemplate
                                }
                                onClose={closeTemplatePanel}
                                onError={onError}
                            />
                        )}
                    </div>
                </div>
            )}

            <form
                className={styles.composer}
                onSubmit={handleTextSubmit}
            >
                <button
                    className={styles.templateButton}
                    type="button"
                    onClick={() => {
                        setSelectedTemplate(
                            null
                        );

                        setIsTemplatePanelOpen(
                            true
                        );
                    }}
                    disabled={
                        isSending
                    }
                    aria-label={t("Enviar plantilla")}
                    title={t("Enviar plantilla")}
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
                        <path d="M4 5h16v14H4Z" />
                        <path d="M8 9h8" />
                        <path d="M8 13h5" />
                    </svg>
                </button>

                <div className={styles.inputContainer}>
                    <textarea
                        value={textBody}
                        onChange={(
                            event
                        ) =>
                            setTextBody(
                                event.target.value
                            )
                        }
                        onKeyDown={handleKeyDown}
                        placeholder={t("Escriba un mensaje...")}
                        maxLength={4096}
                        rows={1}
                        disabled={isSending}
                        aria-label={t("Mensaje")}
                    />

                    <span className={styles.characterCount}>
                        {textBody.length}/4096
                    </span>
                </div>

                <button
                    className={styles.sendButton}
                    type="submit"
                    disabled={
                        !textBody.trim() ||
                        isSending
                    }
                    aria-label={t("Enviar mensaje")}
                >
                    {isSending ? (
                        <span className={styles.spinner}></span>
                    ) : (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                        </svg>
                    )}

                    <span>
                        {isSending
                            ? "Enviando"
                            : t("Enviar")}
                    </span>
                </button>
            </form>
        </div>
    );
}


export default MessageComposer;

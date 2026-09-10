import {
    useState,
} from "react";

import {
    startConversationWithTemplate,
} from "../../../services/monitoring.js";

import TemplateParameterForm from "./TemplateParameterForm.jsx";
import TemplatePicker from "./TemplatePicker.jsx";

import styles from "./NewConversationPanel.module.css";


const STEP_RECIPIENT =
    "recipient";

const STEP_TEMPLATE =
    "template";

const STEP_PARAMETERS =
    "parameters";


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
function NewConversationPanel({
    companyId,
    branchId,
    numberId,
    onClose,
    onConversationCreated,
    onError,
}) {
    const [
        step,
        setStep,
    ] = useState(
        STEP_RECIPIENT
    );

    const [
        recipientPhoneNumber,
        setRecipientPhoneNumber,
    ] = useState("");

    const [
        selectedTemplate,
        setSelectedTemplate,
    ] = useState(null);

    const [
        isSending,
        setIsSending,
    ] = useState(false);


    /**
     * normalizePhoneNumber
     *
     * Description:
     * - Normalizar el número destino conservando únicamente dígitos.
     */
    function normalizePhoneNumber(
        value
    ) {
        return String(
            value || ""
        ).replace(
            /\D/g,
            ""
        );
    }


    /**
     * handleRecipientSubmit
     *
     * Description:
     * - Validar el número destino y avanzar a selección de plantilla.
     */
    function handleRecipientSubmit(
        event
    ) {
        event.preventDefault();

        const normalizedPhoneNumber =
            normalizePhoneNumber(
                recipientPhoneNumber
            );

        if (
            normalizedPhoneNumber.length <
            8
        ) {
            onError?.(
                "Debe proporcionar un número de WhatsApp válido incluyendo el código de país."
            );

            return;
        }

        setRecipientPhoneNumber(
            normalizedPhoneNumber
        );

        onError?.("");

        setStep(
            STEP_TEMPLATE
        );
    }


    /**
     * handleTemplateSelect
     *
     * Description:
     * - Seleccionar una plantilla y avanzar a configuración de parámetros.
     */
    function handleTemplateSelect(
        template
    ) {
        setSelectedTemplate(
            template
        );

        setStep(
            STEP_PARAMETERS
        );
    }


    /**
     * handleTemplateSend
     *
     * Description:
     * - Enviar la plantilla seleccionada para iniciar o reutilizar la conversación.
     */
    async function handleTemplateSend(
        components
    ) {
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

        setIsSending(true);

        onError?.("");

        try {
            const response =
                await startConversationWithTemplate(
                    companyId,
                    branchId,
                    numberId,
                    recipientPhoneNumber,
                    selectedTemplate.id,
                    components
                );

            const responseData =
                response?.data || {};

            onConversationCreated?.({
                customerId:
                    responseData.customer_id,

                conversationId:
                    responseData.conversation_id,

                message:
                    responseData.message,
            });
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible iniciar la conversación."
            );
        } finally {
            setIsSending(false);
        }
    }


    /**
     * renderRecipientStep
     *
     * Description:
     * - Renderizar captura del número destino.
     */
    function renderRecipientStep() {
        return (
            <form
                className={styles.recipientForm}
                onSubmit={
                    handleRecipientSubmit
                }
            >
                <div className={styles.stepHeader}>
                    <span className={styles.eyebrow}>
                        Nueva conversación
                    </span>

                    <h2>
                        Seleccione el destinatario
                    </h2>

                    <p>
                        Ingrese el número de WhatsApp del cliente incluyendo su código de país.
                    </p>
                </div>

                <label className={styles.field}>
                    <span>
                        Número de WhatsApp
                    </span>

                    <div className={styles.phoneInput}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect
                                x="6"
                                y="2.5"
                                width="12"
                                height="19"
                                rx="2"
                            />

                            <path d="M10 18h4" />
                        </svg>

                        <input
                            type="tel"
                            value={
                                recipientPhoneNumber
                            }
                            onChange={(
                                event
                            ) =>
                                setRecipientPhoneNumber(
                                    event.target.value
                                )
                            }
                            placeholder="50499999999"
                            autoFocus
                        />
                    </div>

                    <small>
                        Ejemplo para Honduras: 50499999999
                    </small>
                </label>

                <div className={styles.actions}>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={
                            !recipientPhoneNumber.trim()
                        }
                    >
                        Continuar

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </form>
        );
    }


    return (
        <div className={styles.overlay}>
            <section className={styles.panel}>
                <header className={styles.panelHeader}>
                    <div className={styles.progress}>
                        <div className={styles.progressStep}>
                            <span
                                className={
                                    step ===
                                    STEP_RECIPIENT
                                        ? styles.progressActive
                                        : styles.progressComplete
                                }
                            >
                                {step ===
                                STEP_RECIPIENT
                                    ? "1"
                                    : "✓"}
                            </span>

                            <small>
                                Destinatario
                            </small>
                        </div>

                        <div
                            className={`${styles.progressLine} ${
                                step !==
                                STEP_RECIPIENT
                                    ? styles.progressLineComplete
                                    : ""
                            }`}
                        />

                        <div className={styles.progressStep}>
                            <span
                                className={
                                    step ===
                                    STEP_TEMPLATE
                                        ? styles.progressActive
                                        : step ===
                                          STEP_PARAMETERS
                                            ? styles.progressComplete
                                            : styles.progressPending
                                }
                            >
                                {step ===
                                STEP_PARAMETERS
                                    ? "✓"
                                    : "2"}
                            </span>

                            <small>
                                Plantilla
                            </small>
                        </div>

                        <div
                            className={`${styles.progressLine} ${
                                step ===
                                STEP_PARAMETERS
                                    ? styles.progressLineComplete
                                    : ""
                            }`}
                        />

                        <div className={styles.progressStep}>
                            <span
                                className={
                                    step ===
                                    STEP_PARAMETERS
                                        ? styles.progressActive
                                        : styles.progressPending
                                }
                            >
                                3
                            </span>

                            <small>
                                Enviar
                            </small>
                        </div>
                    </div>

                    <button
                        className={styles.closeButton}
                        type="button"
                        onClick={onClose}
                        disabled={
                            isSending
                        }
                        aria-label="Cerrar nueva conversación"
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
                            <path d="m6 6 12 12" />
                            <path d="m18 6-12 12" />
                        </svg>
                    </button>
                </header>

                <div className={styles.content}>
                    {step ===
                        STEP_RECIPIENT &&
                        renderRecipientStep()}

                    {step ===
                        STEP_TEMPLATE && (
                        <TemplatePicker
                            companyId={
                                companyId
                            }
                            branchId={
                                branchId
                            }
                            numberId={
                                numberId
                            }
                            selectedTemplateId={
                                selectedTemplate?.id
                            }
                            onSelect={
                                handleTemplateSelect
                            }
                            onClose={() =>
                                setStep(
                                    STEP_RECIPIENT
                                )
                            }
                            onError={
                                onError
                            }
                        />
                    )}

                    {step ===
                        STEP_PARAMETERS &&
                        selectedTemplate && (
                        <TemplateParameterForm
                            template={
                                selectedTemplate
                            }
                            isSending={
                                isSending
                            }
                            onBack={() => {
                                setSelectedTemplate(
                                    null
                                );

                                setStep(
                                    STEP_TEMPLATE
                                );
                            }}
                            onSubmit={
                                handleTemplateSend
                            }
                        />
                    )}
                </div>
            </section>
        </div>
    );
}


export default NewConversationPanel;
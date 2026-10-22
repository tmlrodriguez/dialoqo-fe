import Button from "../../../common/buttons/Button/Button.jsx";
import RecipientForm from "../../forms/RecipientForm/RecipientForm.jsx";
import TemplateParameterForm from "../../forms/TemplateParameterForm/TemplateParameterForm.jsx";

import TemplatePicker from "../TemplatePicker/TemplatePicker.jsx";

import styles from "./NewConversationPanelView.module.css";

/**
 * NewConversationPanelView
 * Description: Render monitoring state and delegate resource operations to its controller.
 */
function NewConversationPanelView({
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
}) {
    return (
        <div className={styles.overlay}>
            <section className={styles.panel}>
                <header className={styles.panelHeader}>
                    <div className={styles.progress}>
                        <div className={styles.progressStep}>
                            <span
                                className={
                                    step === STEP_RECIPIENT
                                        ? styles.progressActive
                                        : styles.progressComplete
                                }
                            >
                                {step === STEP_RECIPIENT ? "1" : "✓"}
                            </span>

                            <small>{t("Destinatario")}</small>
                        </div>

                        <div
                            className={`${styles.progressLine} ${
                                step !== STEP_RECIPIENT ? styles.progressLineComplete : ""
                            }`}
                        />

                        <div className={styles.progressStep}>
                            <span
                                className={
                                    step === STEP_TEMPLATE
                                        ? styles.progressActive
                                        : step === STEP_PARAMETERS
                                          ? styles.progressComplete
                                          : styles.progressPending
                                }
                            >
                                {step === STEP_PARAMETERS ? "✓" : "2"}
                            </span>

                            <small>{t("Plantilla")}</small>
                        </div>

                        <div
                            className={`${styles.progressLine} ${
                                step === STEP_PARAMETERS ? styles.progressLineComplete : ""
                            }`}
                        />

                        <div className={styles.progressStep}>
                            <span
                                className={
                                    step === STEP_PARAMETERS
                                        ? styles.progressActive
                                        : styles.progressPending
                                }
                            >
                                3
                            </span>

                            <small>{t("Enviar")}</small>
                        </div>
                    </div>

                    <Button
                        className={styles.closeButton}
                        type="button"
                        onClick={onClose}
                        disabled={isSending}
                        aria-label={t("Cerrar nueva conversación")}
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
                    </Button>
                </header>

                <div className={styles.content}>
                    {step === STEP_RECIPIENT && (
                        <RecipientForm
                            onSubmit={handleRecipientSubmit}
                            t={t}
                            initialPhoneNumber={recipientPhoneNumber}

                            onClose={onClose}
                        />
                    )}

                    {step === STEP_TEMPLATE && (
                        <TemplatePicker
                            companyId={companyId}
                            branchId={branchId}
                            numberId={numberId}
                            selectedTemplateId={selectedTemplate?.id}
                            onSelect={handleTemplateSelect}
                            onClose={() => setStep(STEP_RECIPIENT)}
                            onError={onError}
                        />
                    )}

                    {step === STEP_PARAMETERS && selectedTemplate && (
                        <TemplateParameterForm
                            template={selectedTemplate}
                            isSending={isSending}
                            onBack={() => {
                                setSelectedTemplate(null);

                                setStep(STEP_TEMPLATE);
                            }}
                            onSubmit={handleTemplateSend}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}

export default NewConversationPanelView;

import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import { useKeyedState } from "../../../../hooks/useKeyedState.js";

import styles from "./MessageTextForm.module.css";

/**
 * MessageTextForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function MessageTextForm({
    onSubmit,
    conversationId,
    setSelectedTemplate,
    setIsTemplatePanelOpen,
    isSending,
    t,
}) {
    const [textBody, setTextBody] = useKeyedState("", conversationId);

    async function handleTextSubmit(event) {
        event.preventDefault();
        if (!textBody.trim() || isSending) return;
        if (await onSubmit(textBody)) setTextBody("");
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (textBody.trim() && !isSending) {
                event.currentTarget.closest("form")?.requestSubmit();
            }
        }
    }

    return (
        <Form className={styles.composer} onSubmit={handleTextSubmit}>
            <Button
                className={styles.templateButton}
                type="button"
                onClick={() => {
                    setSelectedTemplate(null);

                    setIsTemplatePanelOpen(true);
                }}
                disabled={isSending}
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
            </Button>

            <div className={styles.inputContainer}>
                <Input
                    as="textarea"
                    value={textBody}
                    onChange={(event) => setTextBody(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("Escriba un mensaje...")}
                    maxLength={4096}
                    rows={1}
                    disabled={isSending}
                    aria-label={t("Mensaje")}
                />

                <span className={styles.characterCount}>{textBody.length}/4096</span>
            </div>

            <Button
                className={styles.sendButton}
                type="submit"
                disabled={!textBody.trim() || isSending}
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

                <span>{isSending ? "Enviando" : t("Enviar")}</span>
            </Button>
        </Form>
    );
}

export default MessageTextForm;
